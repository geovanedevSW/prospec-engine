import { Repository } from '../persistence/database.js';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIServiceConfig {
  provider: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export function sanitizeHumanizerText(text: string): string {
  if (!text) return text;
  let cleaned = text;

  // Rule §8: Prohibit em dashes (—) and en dashes (–) as universal connectors
  // If dash is followed by a capital letter, replace with period
  cleaned = cleaned.replace(/\s*[—–]\s*([A-ZÀ-Ú])/g, '. $1');
  // Otherwise replace with comma
  cleaned = cleaned.replace(/\s*[—–]\s*/g, ', ');
  // Replace double hyphen connectors (" -- ") with comma
  cleaned = cleaned.replace(/\s+--\s+/g, ', ');

  // Rule §9: Inflated claims & Stock AI words
  cleaned = cleaned.replace(/\bnota impecável\b/gi, 'ótima nota');
  cleaned = cleaned.replace(/\bavaliação impecável\b/gi, 'ótima avaliação');
  cleaned = cleaned.replace(/\breputação impecável\b/gi, 'ótima reputação');
  cleaned = cleaned.replace(/\btrabalho impecável\b/gi, 'ótimo trabalho');
  cleaned = cleaned.replace(/\bfalar brevemente\b/gi, 'trocar uma ideia rápida');
  cleaned = cleaned.replace(/\bconversar brevemente\b/gi, 'conversar rapidinho');
  cleaned = cleaned.replace(/\bvitrine digital definitiva\b/gi, 'vitrine na internet');
  cleaned = cleaned.replace(/\balavancar\b/gi, 'aumentar');
  cleaned = cleaned.replace(/\brevolucionar\b/gi, 'melhorar');

  // Clean double commas or punctuation artifacts
  cleaned = cleaned.replace(/,\s*,/g, ',');
  cleaned = cleaned.replace(/,\s*\./g, '.');
  cleaned = cleaned.replace(/\.\s*\./g, '.');

  return cleaned.trim();
}

export class AIService {
  private static getEffectiveConfig(): AIServiceConfig {
    const provider = Repository.getSetting('ai_provider', process.env.LLM_PROVIDER || 'anthropic');
    const baseUrl = Repository.getSetting('ai_base_url', process.env.LLM_BASE_URL || 'https://ghostcli.cloud');
    const apiKey = Repository.getSetting('ai_api_key', process.env.LLM_API_KEY || 'gcli_yaoHuyQP0XwaGVaow-ek0SUrogs-HiWr');
    const model = Repository.getSetting('ai_model', process.env.LLM_MODEL || 'claude-sonnet-5');

    return { provider, baseUrl, apiKey, model };
  }

  static getConfig(): { provider: string; baseUrl: string; model: string; hasKey: boolean; maskedKey: string } {
    const config = this.getEffectiveConfig();
    const maskedKey = config.apiKey
      ? config.apiKey.length > 8
        ? `${config.apiKey.slice(0, 5)}...${config.apiKey.slice(-4)}`
        : '***'
      : '';
    return {
      provider: config.provider,
      baseUrl: config.baseUrl,
      model: config.model,
      hasKey: Boolean(config.apiKey),
      maskedKey
    };
  }

  static saveConfig(newConfig: Partial<AIServiceConfig>) {
    if (newConfig.provider) Repository.setSetting('ai_provider', newConfig.provider);
    if (newConfig.baseUrl) Repository.setSetting('ai_base_url', newConfig.baseUrl);
    if (newConfig.apiKey) Repository.setSetting('ai_api_key', newConfig.apiKey);
    if (newConfig.model) Repository.setSetting('ai_model', newConfig.model);
  }

  static async checkStatus(): Promise<{
    available: boolean;
    provider: string;
    model: string;
    baseUrl: string;
    latencyMs?: number;
    message?: string;
    error?: string;
  }> {
    const config = this.getEffectiveConfig();
    if (!config.apiKey) {
      return {
        available: false,
        provider: config.provider,
        model: config.model,
        baseUrl: config.baseUrl,
        error: 'Chave de API não configurada'
      };
    }

    const startTime = Date.now();
    try {
      const response = await fetch(`${config.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: 20,
          messages: [{ role: 'user', content: 'ping' }]
        }),
        signal: AbortSignal.timeout(10000)
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = (errorData as any)?.error?.message || `HTTP ${response.status} ${response.statusText}`;
        return {
          available: false,
          provider: config.provider,
          model: config.model,
          baseUrl: config.baseUrl,
          latencyMs,
          error: errMsg
        };
      }

      return {
        available: true,
        provider: config.provider,
        model: config.model,
        baseUrl: config.baseUrl,
        latencyMs,
        message: 'Claude Sonnet conectado com sucesso'
      };
    } catch (err: any) {
      return {
        available: false,
        provider: config.provider,
        model: config.model,
        baseUrl: config.baseUrl,
        latencyMs: Date.now() - startTime,
        error: err.message || 'Falha ao conectar com o serviço de IA'
      };
    }
  }

  static async chat(params: {
    messages: ChatMessage[];
    leadContext?: any;
    customSystemPrompt?: string;
  }): Promise<{ content: string; model: string; latencyMs: number }> {
    const config = this.getEffectiveConfig();
    const startTime = Date.now();

    let systemPrompt = params.customSystemPrompt || `
Você é o Claude Sonnet 5, Copilot Estratégico de Vendas e Tecnologia do Prospec.
Sua missão é dar suporte de alto nível para o operador de prospecção de negócios locais (RMBH - Contagem, Betim, BH, etc.).
Áreas de domínio:
1. Diagnóstico de comércios locais (barbearias, oficinas, clínicas, dentistas, pet shops, estúdios, restaurantes).
2. Estratégias de abordagem fria e quente via WhatsApp com foco em valor real e geração de confiança.
3. Superação de objeções clássicas ("já tenho quem faça", "não preciso de site", "tá caro", "não posso falar agora").
4. Criação de copies autênticas aplicando com rigor a skill HUMANIZER:
   - PROIBIDO TRAVESSÕES (— ou –) ou traços duplos (--). Em mensagens de WhatsApp no Brasil pessoas reais NUNCA usam travessão. Use vírgula, ponto ou parênteses.
   - PROIBIDO adjetivos inflados típicos de IA ("impecável", "excepcional", "formidável", "primoroso", "revolucionar", "alavancar", "divisor de águas"). Em vez de "nota impecável", use "ótima nota" ou "muito bem recomendados".
   - PROIBIDO fórmulas de IA ("não apenas X, mas Y", "não é só um site, é...", frases dramáticas de fechamento como "Pense nisso.").
   - Escreva como um prestador de serviço real da Grande BH: natural, direto, educado e focado no negócio do cliente.
5. Orientação técnica e visual para criação de protótipos de alta conversão.

Seja direto, prático, assertivo e escreva sempre em português brasileiro de forma natural e profissional.
`;

    if (params.leadContext) {
      const lc = params.leadContext;
      systemPrompt += `\n\n[CONTEXTO DO LEAD ATIVO SELECIONADO NA CENTRAL]:
- Nome do Negócio: ${lc.name || 'Não informado'}
- Nicho/Categoria: ${lc.category || lc.nicheLabel || 'Não informado'}
- Cidade: ${lc.city || 'Não informada'}
- Telefone: ${lc.phoneNorm || lc.phoneRaw || 'Não informado'}
- Situação do Site: ${lc.siteStatus === 'none' ? 'SEM SITE CADASTRADO' : lc.siteStatus} (Auditoria: ${lc.siteAuditReason || 'Nenhuma'})
- Avaliação Google Maps: ${lc.rating ? `${lc.rating} estrelas` : 'Sem nota'} (${lc.reviewsCount || 0} avaliações)
${lc.userReviews ? `- Comentários reais de clientes: ${typeof lc.userReviews === 'string' ? lc.userReviews.slice(0, 1000) : JSON.stringify(lc.userReviews).slice(0, 1000)}` : ''}
${lc.notes ? `- Observações registradas: ${lc.notes}` : ''}
Use esse contexto quando a dúvida do operador for sobre este negócio.`;
    }

    const payload = {
      model: config.model,
      max_tokens: 3000,
      system: systemPrompt.trim(),
      messages: params.messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    };

    const response = await fetch(`${config.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const msg = (errBody as any)?.error?.message || `HTTP ${response.status}`;
      throw new Error(`Falha no Claude Sonnet (${response.status}): ${msg}`);
    }

    const data = await response.json() as any;
    const textBlock = data?.content?.find((c: any) => c.type === 'text');
    const rawContent = textBlock?.text || 'Sem resposta retornada pelo modelo.';
    const content = sanitizeHumanizerText(rawContent);

    // Automatically persist conversation in SQLite
    try {
      const lastUserMsg = params.messages[params.messages.length - 1];
      if (lastUserMsg && lastUserMsg.role === 'user') {
        Repository.saveAiMessage({
          leadId: params.leadContext?.id || null,
          role: 'user',
          content: lastUserMsg.content
        });
      }
      Repository.saveAiMessage({
        leadId: params.leadContext?.id || null,
        role: 'assistant',
        content
      });
    } catch (saveErr: any) {
      console.warn('[AIService] Aviso ao persistir histórico:', saveErr.message);
    }

    return {
      content,
      model: data?.model || config.model,
      latencyMs
    };
  }

  static getHistory(leadId?: string | null) {
    return Repository.getAiMessages(leadId);
  }

  static clearHistory(leadId?: string | null) {
    return Repository.clearAiMessages(leadId);
  }

  static async generateHumanizedApproaches(leadId: string, options?: { senderName?: string }): Promise<{
    lead: any;
    fullText: string;
    options: Array<{ title: string; text: string }>;
    tips: string[];
    model: string;
    latencyMs: number;
  }> {
    const lead = Repository.getLeadById(leadId);
    if (!lead) {
      throw new Error(`Lead ${leadId} não encontrado no banco de dados.`);
    }

    const sender = options?.senderName || 'Geovane';

    const prompt = `Gere abordagens comerciais humanizadas para envio no WhatsApp para este comércio local.

DIRETRIZES OBRIGATÓRIAS DA SKILL HUMANIZER (ELIMINAÇÃO ABSOLUTA DE VÍCIOS DE IA):
1. REGRA CRÍTICA DE PONTUAÇÃO (HUMANIZER §8 - PROIBIDO TRAVESSÃO):
   - NUNCA use travessão (— ou –) ou traços duplos (--). Em WhatsApp no Brasil ninguém escreve "50 avaliações — parabéns". Use vírgula, ponto ou parênteses simples.
   - O uso de travessão denuncia imediatamente que o texto foi gerado por robô/IA.

2. PROIBIÇÃO DE ADJETIVOS INFLADOS (HUMANIZER §9):
   - NUNCA use palavras de chatbot: "nota impecável", "avaliação impecável", "reputação impecável", "excepcional", "formidável", "crucial", "fundamental", "revolucionar", "alavancar".
   - Use palavras reais de quem manda mensagem: "ótimas avaliações", "nota 5.0 no Google com bastante elogio", "muito bem recomendados".

3. PROIBIÇÃO DE FÓRMULAS E CLICHÊS DE VENDAS:
   - PROIBIDO: "não apenas X, mas Y", "não é só um site, é...", "não é sobre X, é sobre Y".
   - PROIBIDO: Frases dramáticas isoladas de fechamento ("Isso faz toda a diferença.", "Pense nisso.", "O resultado fala por si.").
   - PROIBIDO: Aberturas encenadas ("Sem mais delongas", "Vamos direto ao ponto", "Para ser bem sincero").
   - PROIBIDO: Tríades forçadas ("inovação, agilidade e confiança").
   - PROIBIDO: Fórmulas explicativas condescendentes como "Como muitos pacientes buscam referências antes de agendar, ter essa vitrine digital ajuda a passar credibilidade".

4. PEDIDO DE CONTATO DIRETO E NATURAL:
   - NUNCA use perguntas duras ou de cartório: "Com quem eu poderia falar brevemente sobre isso?".
   - Use a fala natural de um profissional brasileiro no WhatsApp: "Com quem posso trocar uma ideia rápida aí na clínica sobre isso?", "Poderia me indicar o responsável pela gestão?", "Quem cuida dessa parte aí com vocês?".

5. APRESENTAÇÃO PESSOAL (OBRIGATÓRIO):
   - Quando for se apresentar, use exatamente: "Sou Geovane, Desenvolvedor de Software..." (ex: "Oi, tudo bem? Sou Geovane, Desenvolvedor de Software aqui da região...", "Olá! Sou Geovane, Desenvolvedor de Software...").
   - NUNCA use termos como "especialista em presença digital", "consultor de marketing" ou "agência". O remetente real é Geovane, Desenvolvedor de Software.

6. TOM E VOZ:
   - Mensagem de WhatsApp: parágrafos curtos, linguagem leve, educada, sem formalidade de cartório e sem bajulação artificial. Remetente: Geovane.

DADOS REAIS DO COMÉRCIO:
- Nome do Negócio: ${lead.name}
- Categoria / Nicho: ${lead.category} (${lead.nicheLabel})
- Cidade: ${lead.city}
- Telefone: ${lead.phoneNorm || lead.phoneRaw}
- Situação do Site: ${lead.siteStatus === 'none' ? 'NÃO POSSUI SITE ATIVO' : lead.siteStatus} (${lead.siteAuditReason || 'sem site'})
- Avaliação Google Maps: ${lead.rating || 'N/A'} estrelas (${lead.reviewsCount || 0} avaliações)
${lead.userReviews ? `- Comentários reais de clientes: ${typeof lead.userReviews === 'string' ? lead.userReviews.slice(0, 800) : JSON.stringify(lead.userReviews).slice(0, 800)}` : ''}

Estruture a resposta exatamente neste padrão:

### Opção 1: Abordagem Direta (Foco no Responsável)
> "Olá, equipe [Nome]. Tudo bem? Sou Geovane, Desenvolvedor de Software aqui da região.
> [Mensagem citando a boa reputação de [rating] estrelas no Google e a oportunidade de ter um site oficial no ar, perguntando com quem pode falar sobre a presença online de forma educada]"

### Opção 2: Abordagem com Demonstração Visual (Protótipo Pronto)
> "Olá! Sou Geovane, Desenvolvedor de Software.
> [Mensagem avisando que preparou uma demonstração visual rápida de como o comércio ficaria no celular para novos clientes e perguntando se pode enviar o link de 1 minuto sem compromisso]"

### Opção 3: Abordagem Curta & Pontual (Início de Conversa)
> "Oi, tudo bem? Sou Geovane, Desenvolvedor de Software.
> [Mensagem rápida e leve de 2 a 3 linhas, excelente para abertura descontraída e pedindo o contato do responsável]"

### Dicas para o Operador ao enviar:
1. [Dica de horário e postura comercial]
2. [Como responder se perguntarem 'quem é você?']
3. [Como responder se perguntarem 'quanto custa?']`;

    const chatResult = await this.chat({
      messages: [{ role: 'user', content: prompt }],
      leadContext: lead
    });

    // Parse options from blockquotes (> "...")
    const extractedOptions: Array<{ title: string; text: string }> = [];
    const text = chatResult.content;

    const optionRegex = /###\s*(Opção\s*\d+[^:\n]*[:\n][^\n]*)\s*\n+>\s*"?([\s\S]*?)"?\s*(?=(?:###|$))/gi;
    let match;
    while ((match = optionRegex.exec(text)) !== null) {
      const title = match[1].replace(/[:\n]/g, '').trim();
      const quoteText = match[2]
        .split('\n')
        .map(l => l.replace(/^>\s*/, '').trim())
        .filter(Boolean)
        .join('\n\n')
        .replace(/^"|"$/g, '');
      if (quoteText) {
        extractedOptions.push({ title, text: quoteText });
      }
    }

    // Fallback if regex didn't catch 3 options: look for any blockquote
    if (extractedOptions.length === 0) {
      const quotes = text.match(/>\s*[\s\S]*?(?=\n\n|$)/g);
      if (quotes) {
        quotes.forEach((q, idx) => {
          const cleaned = q.replace(/^>\s*/gm, '').replace(/^"|"$/g, '').trim();
          if (cleaned.length > 20) {
            extractedOptions.push({ title: `Opção ${idx + 1}`, text: cleaned });
          }
        });
      }
    }

    const sanitizedOptions = extractedOptions.map(opt => ({
      title: opt.title,
      text: sanitizeHumanizerText(opt.text)
    }));

    return {
      lead: {
        id: lead.id,
        name: lead.name,
        category: lead.category,
        city: lead.city,
        pitchType: lead.pitchType
      },
      fullText: sanitizeHumanizerText(chatResult.content),
      options: sanitizedOptions,
      tips: [],
      model: chatResult.model,
      latencyMs: chatResult.latencyMs
    };
  }

  static async analyzeLead(leadId: string): Promise<{
    lead: any;
    analysis: string;
    model: string;
    latencyMs: number;
  }> {
    const lead = Repository.getLeadById(leadId);
    if (!lead) {
      throw new Error(`Lead ${leadId} não encontrado no banco de dados.`);
    }

    const prompt = `Analise o seguinte lead comercial da nossa operação e gere um raio-X estratégico:

Nome: ${lead.name}
Categoria/Nicho: ${lead.category} (${lead.nicheLabel})
Cidade: ${lead.city}
Telefone: ${lead.phoneNorm || lead.phoneRaw}
Status do Site: ${lead.siteStatus} (Auditoria: ${lead.siteAuditReason || 'N/A'})
Nota Google: ${lead.rating || 'N/A'} (${lead.reviewsCount || 0} avaliações)
${lead.userReviews ? `Reviews reais de clientes: ${typeof lead.userReviews === 'string' ? lead.userReviews : JSON.stringify(lead.userReviews)}` : ''}
${lead.notes ? `Notas internas: ${lead.notes}` : ''}

Estruture sua resposta de forma enxuta e visualmente escaneável:
1. **Diagnóstico Rápido:** Presença digital atual e pontos fortes/fracos.
2. **Oportunidade de Ouro:** O melhor gancho para chamar a atenção do dono (citando elogios ou dores reais dos clientes).
3. **Mensagem de Primeiro Contato (WhatsApp):** Sugestão de texto pronto, humanizado, simpático e de alto valor, sem parecer robô de vendas.
4. **Objeção Mais Provável & Como Responder:** A principal resistência que o dono deve ter e a réplica ideal.`;

    const chatResult = await this.chat({
      messages: [{ role: 'user', content: prompt }],
      leadContext: lead
    });

    return {
      lead: {
        id: lead.id,
        name: lead.name,
        category: lead.category,
        city: lead.city,
        pitchType: lead.pitchType
      },
      analysis: chatResult.content,
      model: chatResult.model,
      latencyMs: chatResult.latencyMs
    };
  }

  static async suggestReply(leadId: string, customInstruction?: string): Promise<{
    lead: any;
    suggestions: string;
    model: string;
    latencyMs: number;
  }> {
    const lead = Repository.getLeadById(leadId);
    if (!lead) {
      throw new Error(`Lead ${leadId} não encontrado.`);
    }

    const messages = Repository.getMessagesByLead(leadId);
    const lastMessagesSummary = messages.length > 0
      ? messages.slice(-6).map(m => `[${m.direction === 'inbound' ? 'CLIENTE' : 'OPERADOR'}]: ${m.body}`).join('\n')
      : 'Ainda não há mensagens registradas no histórico.';

    const prompt = `O lead "${lead.name}" (${lead.category} em ${lead.city}) está no nosso funil de WhatsApp.

Histórico recente da conversa:
${lastMessagesSummary}

${customInstruction ? `Instrução adicional do operador: ${customInstruction}` : 'O cliente acabou de responder ou precisamos dar continuidade na conversa.'}

Gere 3 alternativas de resposta humana para o operador enviar no WhatsApp:
- **Opção 1 (Direta e Simpática):** Resposta objetiva e leve para manter o canal aberto.
- **Opção 2 (Com Foco no Protótipo / Visual):** Mostra que já preparamos uma demonstração prática ou benefício exclusivo para o negócio dele.
- **Opção 3 (Contorno de Objeção / Estratégica):** Desarma com elegância dúvidas de preço, tempo ou prioridade.

Escreva cada opção pronta para copiar e colar, mantendo tom profissional, sem formalidades excessivas e sem emojis exagerados.`;

    const chatResult = await this.chat({
      messages: [{ role: 'user', content: prompt }],
      leadContext: lead
    });

    return {
      lead: {
        id: lead.id,
        name: lead.name,
        category: lead.category,
        city: lead.city
      },
      suggestions: chatResult.content,
      model: chatResult.model,
      latencyMs: chatResult.latencyMs
    };
  }
}

