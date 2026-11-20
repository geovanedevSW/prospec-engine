# Manual de Operação: Central Local (Fase 0)

Este documento orienta o proprietário na operação diária da **Central Local de Venda de Sites**.

---

## 1. Inicialização e Acesso

A central local consolida em um único ponto no navegador os três sistemas: **Google Maps Scraper Kit**, **OpenWA** e **Doop**.

### Comando de Inicialização
No diretório `prospec-engine/prospec-app`:
```bash
npm start
```
Ou em modo de desenvolvimento com recarregamento em tempo real:
```bash
npm run dev
```

* **Ponto de entrada no navegador:** `http://localhost:3333`
* **Auto-Start do Doop:** Ao iniciar, a central dispara automaticamente o `bun run dev` dentro de `../doop`, subindo a interface do Doop na porta 4300 e o servidor na porta 4400.
* **API de status e saúde:** `http://localhost:3333/api/status`
* **Banco de dados local:** `prospec-app/data/operacao.sqlite`

---

## 2. Visão Geral das Abas do Painel

### Aba 1: Visão Geral
* **Status dos Três Serviços:** Exibe em tempo real o status de cada módulo (`available`, `connected`, `disconnected` ou `mock`), com diagnóstico da porta e instruções de ação.
* **Métricas do Funil:** Contagem total de leads, oportunidades de alto valor (sem site cadastrado, site fora do ar), e protótipos ativos.
* **Ação Rápida de Importação:** Botão para carregar 100+ comércios reais da RMBH extraídos pelo scraper kit com um único clique.

### Aba 2: Prospecção & Contatos
* **Filtros Avançados:** Filtro por tipo de presença digital:
  * 🔥 **Sem Site:** Comércio sem nenhuma presença web listada (alta prioridade).
  * ⚠️ **Site Fora do Ar:** Comércio com site registrado que retorna erro HTTP (404, 500, offline).
  * 💬 **Usa WhatsApp como Site:** Comércio que usa link `wa.me` no lugar de site profissional.
  * 📸 **Usa Rede Social:** Comércio que depende exclusivamente do Instagram/Facebook.
  * 🔗 **Usa Link de Bio:** Comércio que usa linktree ou similares.
  * ✅ **Site Ativo:** Comércio com presença digital já estabelecida.
* **Ações Integradas (Sem Redigitação):**
  * Botão **WhatsApp**: Abre a aba WhatsApp com o comércio e o pitch pré-selecionados.
  * Botão **Protótipo**: Abre a aba Protótipos com o briefing pré-preenchido.

### Aba 3: WhatsApp
* **Geração de Abordagem Contextualizada:** O texto da mensagem é gerado automaticamente de acordo com o diagnóstico do comércio (ex: se o site está fora do ar, a abordagem cita esse problema específico).
* **Fluxo de Aprovação Obrigatória:**
  1. O operador confere destinatário e mensagem na tela.
  2. Clica em **"Aprovar Conteúdo"** (o status muda para aprovado).
  3. Clica em **"Enviar WhatsApp"**.
* **Salvaguardas de Segurança:** No modo padrão (`integrado_sem_envio`), o envio é registrado e simulado com segurança, sem risco de bloqueio de número ou envio involuntário.

### Aba 4: Protótipos Doop (5 Pilares Estratégicos de Conversão)
* **Pilar 1 - Temas Visuais por Segmento:** Seletor de estilo no briefing com detecção automática ou manual:
  * 💈 **Dark Barber Luxury:** Fundo grafite/carvão `#0c0c0e`, ouro/âmbar `amber-500`, tipografia robusta e estilo clássico para barbearias e tatuagem.
  * ✨ **Saúde & Odonto Clean:** Estilo hospitalar moderno, tons de esmeralda/teal `emerald-600` e selos de confiança.
  * 🍕 **Gastronomia & Restaurantes:** Tons quentes de apetite (`rose-600` / carvão), cardápio visual e delivery térmico.
  * 🔧 **Oficinas & Centro Automotivo:** Estilo industrial técnico (`slate-900` / `yellow-500`) com foco em segurança e diagnóstico.
  * 🏢 **Moderno Corporativo:** Visual minimalista em índigo/azul para serviços gerais.
* **Pilar 2 - Dados Reais do Scraper & Ficha do Google Maps:**
  * Injeção automática da nota oficial (`★ 5.0`) e quantidade de avaliações verificadas do lead.
  * **Comentários e Depoimentos Reais:** Suporte nativo à coluna `user_reviews` (via flag `--reviews` no scraper kit). Quando disponíveis, os depoimentos do protótipo exibem o nome do cliente real, texto verificado e estrelas.
  * Acesso rápido à ficha do Google Maps direto pela tabela de prospecção e cabeçalho do lead.
* **Pilar 3 - Vitrine de Serviços & Fotos Ilustrativas de Alta Resolução:**
  * Cards temáticos com fotografias reais em alta definição do Unsplash categorizadas por nicho e tempo estimado de execução.
* **Pilar 4 - Elementos Interativos de Conversão:**
  * **Modal de Agendamento Inteligente:** Permite selecionar o serviço, dia e período (manhã/tarde/noite), gerando a mensagem formatada para envio direto no WhatsApp.
  * **FAQ em Acordeão Interativo:** Respostas rápidas e expansíveis para eliminar objeções do cliente.
  * **Botão Flutuante de WhatsApp:** Pulsante com badge "Online agora" no canto inferior direito.
* **Pilar 5 - Seção "Onde Estamos" & Horários com Mapa Interativo:**
  * Iframe oficial embutido do Google Maps Embed sem necessidade de API key paga.
  * Botões diretos para *"Abrir no Google Maps"* e *"Traçar Rota no GPS"* (Waze / Maps).
  * Grade com horários de funcionamento e status de atendimento.

### Aba 5: Configurações & Operação
* **Alternador de Modos:**
  * `mock`: Isolamento completo.
  * `integrado_sem_envio`: Modo padrão de operação segura.
  * `real`: Permite envio real sob aprovação explícita.
* **Diagnóstico de Pré-requisitos:** Verificação de Node.js, SQLite nativo, e presença dos 3 repositórios no disco.
* **Status do Claude Sonnet 5:** Validação de conectividade com a API da Anthropic via GhostCLI, tempo de resposta em milissegundos e chave mascarada.

---

## 3. Copilot Estratégico de IA (Claude Sonnet 5 via GhostCLI)

A central integra diretamente o modelo **Claude Sonnet 5** para consultoria e redação em tempo real:

* **Drawer Lateral Deslizante (`AiCopilotDrawer`):** Acessível a qualquer instante pelo botão flutuante no canto inferior direito ou na barra superior, mantendo histórico de mensagens gravado no SQLite.
* **Diagnóstico de Lead Automatizado:** No modal de detalhes de qualquer comércio, o botão *"Diagnóstico Claude Sonnet"* gera uma auditoria instantânea baseada nas avaliações Google, nicho e presença web.
* **Gerador de Abordagens Humanizadas no WhatsApp Studio:** Gera 3 opções de abordagem sem os vícios clássicos de IA (sem travessões `—`, linguagem brasileira natural e persuasiva), calibradas pela diretriz `humanizer`.
* **Sugestão de Respostas a Objeções:** Auxilia o operador a responder dúvidas e contornar objeções na timeline de mensagens do WhatsApp.

---

## 4. Procedimento de Backup e Restauração

O estado comercial, o funil, o histórico de abordagens e as versões dos protótipos ficam persistidos exclusivamente em `prospec-app/data/operacao.sqlite`.

### Fazer Backup:
```powershell
Copy-Item "prospec-app\data\operacao.sqlite" "prospec-app\data\operacao-backup-$(Get-Date -Format 'yyyyMMdd-HHmm').sqlite"
```

### Restaurar Backup:
1. Pare o processo da central (`Ctrl + C`).
2. Substitua `prospec-app/data/operacao.sqlite` pelo arquivo de backup desejado.
3. Inicie novamente com `npm start`.

