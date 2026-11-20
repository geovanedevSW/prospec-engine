# Prospec — Central de Aquisição & Venda de Sites

> **Plataforma local consolidada para prospecção de comércios, qualificação de leads, abordagem comercial via WhatsApp e geração instantânea de protótipos de alta conversão.**

---

## ⚡ Visão Geral

O **Prospec** centraliza em uma única interface executável todo o ciclo de vida da venda de sites para negócios locais (RMBH e expansão), conectando e orquestrando três motores complementares:

1. 🔍 [**`google-maps-scraper-kit`**](https://github.com/Mahanaicoach/google-maps-scraper-kit) (por [@Mahanaicoach](https://github.com/Mahanaicoach)): Descoberta automatizada de comércios no Google Maps, extração de reviews reais, contatos e diagnóstico de presença digital.
2. 💬 [**`OpenWA`**](https://github.com/rmyndharis/OpenWA) (por [@rmyndharis](https://github.com/rmyndharis)): Gateway HTTP e mensageria WhatsApp com sessões Baileys para condução de conversas e envio de demonstrações.
3. 🎨 [**`doop`**](https://github.com/kgoedecke/doop) (por [@kgoedecke](https://github.com/kgoedecke)): Canvas de design visual e motor de artboards multiplayer para prototipagem de alta fidelidade via protocolo MCP.

---

## 🚀 Como Iniciar

### 1. Pré-requisitos
* **Node.js** v22.19.0 ou superior (com suporte ao SQLite nativo `node:sqlite`).
* **npm** 10+.
* *(Opcional)* **Bun** v1.4+ para gerenciamento e auto-start do Doop Studio (`~/.bun/bin/bun.exe`).

### 2. Instalação e Compilação
Na pasta do projeto (`prospec-app`):
```bash
npm install
npm run build
```

### 3. Execução
```bash
npm start
```

Ao iniciar, o **Prospec**:
1. Inicia o servidor HTTP e o painel unificado em **[http://localhost:3333](http://localhost:3333)**.
2. Auto-popula o banco SQLite local (`data/operacao.sqlite`) com os leads reais de comércios caso esteja vazio.
3. Dispara automaticamente o comando `bun run dev` do Doop Studio caso o binário esteja presente no sistema:
   * Interface Web do Doop em **[http://localhost:4300](http://localhost:4300)**.
   * Servidor Express e endpoint MCP em **[http://localhost:4400](http://localhost:4400)**.
4. Trata encerramento gracioso (`Ctrl + C`), finalizando os processos filhos ordenadamente.

---

## 🏛️ Padrões de Engenharia & Arquitetura

* **Stack Fullstack:** Interface SPA reativa (React 18 + Vite 6 + Tailwind v4 + GSAP) comunicando-se com API RESTful em Express e Node.js 22 nativo.
* **Ciclo CRUD Integral:** Persistência relacional para todo o funil comercial (criação, leitura com filtros e paginação, atualização de etapas e exclusão de registros em Leads, Protótipos, Mensagens e Histórico de IA).
* **Aderência a SOLID & Clean Code:** Separação estrita de responsabilidades entre adaptadores externos (`discoveryAdapter`, `messagingAdapter`, `prototypeAdapter`), orquestradores de ciclo de vida (`doopProcessManager`), serviços de IA (`aiService`) e repositório tipado (`database.ts`).
* **Design Defensivo:** Tolerância a falhas com fallbacks automáticos caso motores externos (Docker, Doop, OpenWA) estejam temporariamente indisponíveis.

---

## 🧩 Funcionalidades Principais

### 1. Prospecção & Qualificação de Leads
* Filtro instantâneo por nichos estratégicos (Saúde & Odonto, Beleza & Estética, Gastronomia, Barbearias, Oficinas, Fitness, Pet Shop, Varejo).
* Mapeamento de gargalos: identificação automática de comércios sem website, com site quebrado ou com presença digital fraca.
* Leitura de avaliações reais e reputação no Google Maps para ancorar argumentos de autoridade.

### 2. Motor de Protótipos de Alta Conversão
* **8 Templates Nativos em React/Tailwind/GSAP:** Renderização ultra-rápida no navegador com visualizador responsivo integrado (Desktop `1280px` e Mobile `390px`).
* **Doop Canvas Multiplayer:** Geração automatizada de pranchetas no Doop via chamadas MCP (`create_frame`, `set_frame_html`).
* **Regras Estritas de Design (GEMINI.md):**
  * Dimensionamento dinâmico sem scrollbars internas via medição headless com Playwright.
  * Botões e CTAs com `white-space: nowrap !important;` e `flex-shrink: 0;` (zero quebra de texto em botões).
  * Ícones vetoriais inline limpos (zero emojis como ícones de interface).

### 3. Abordagem Comercial Estratégica (WhatsApp Studio)
* **Geração de Pitches sob Medida:** Abordagens personalizadas utilizando dados reais e comprovados do Google Maps.
* Variações de abordagem sob medida:
  * *Comércio sem site:* demonstração visual ao vivo destacando agendamento direto e presença profissional.
  * *Comércio com site antigo/lento:* comparativo de performance, modernidade e experiência mobile.
  * *Comércio muito bem avaliado:* destaque de reputação e avaliações 5 estrelas do Google.
* Histórico completo de mensagens e timeline integrada no WhatsApp.

### 4. Deploy em 1 Clique na Vercel
* Deploy automatizado de landing pages React Vite diretamente para a Vercel através da API REST oficial.
* Geração de URLs de produção (`https://...vercel.app`) para envio instantâneo ao comerciante.

### 5. Copilot de IA & LLM (Claude Sonnet 5 via GhostCLI)
* **Drawer Lateral Interativo (`AiCopilotDrawer`):** Assistente comercial contextual integrado diretamente ao painel, com histórico persistido no SQLite.
* **Diagnóstico Estratégico de Lead:** Análise em tempo real do comércio local com base nos dados do Google Maps (avaliações, nicho, presença web e gargalos de conversão).
* **Gerador de Abordagens Humanizadas:** Criação de pitches comerciais calibrados pela skill `humanizer` (sem vícios de IA, sem travessões `—`, linguagem brasileira autêntica e persuasiva).
* **Sugestão de Respostas no WhatsApp Studio:** Auxílio instantâneo para contornar objeções de clientes na timeline de mensagens.
* **Suporte Multi-Provedor (Anthropic Messages API / GhostCLI):** Configuração com chave mascarada, medição de latência em tempo real e fallback resiliente.

---

## ⚙️ Configuração (`.env`)

Copie `.env.example` para `.env` para customizar portas e chaves:

```env
# Porta da Central Prospec
PORT=3333

# Modos de Operação:
# - 'mock': 100% simulado, isolado
# - 'integrado_sem_envio': dados reais lidos, disparos bloqueados com segurança (PADRÃO)
# - 'real': permite envios reais via WhatsApp
OPERATION_MODE=integrado_sem_envio

# Portas dos Serviços Integrados
SCRAPER_PORT=8080
OPENWA_PORT=2785
DOOP_PORT=4400
DOOP_CLIENT_PORT=4300

# Provedores de IA - Claude Sonnet 5 via GhostCLI (Anthropic Messages API)
LLM_PROVIDER=anthropic
LLM_BASE_URL=https://ghostcli.cloud
LLM_API_KEY=gcli_sua_chave_aqui
LLM_MODEL=claude-sonnet-5
LLM_SUPPORTS_VISION=true
```

---

## 🧪 Testes Automatizados

### Suíte de Testes Unitários e Integração:
```bash
npm test
```
*Executa testes cobrindo integração com SQLite, rotas REST, process manager, adaptadores dos 3 serviços e sanitização de texto.*

### Validação de UI e Telas:
```bash
npm run build
npx playwright test
```

---

## 📁 Estrutura de Diretórios

```text
prospec-app/
├── data/
│   └── operacao.sqlite            # Banco local SQLite (armazenamento persistente)
├── deployments/                   # Projetos e landing pages geradas para deploy
│   ├── ds-odontologia/            # Site completo DS Odontologia (React + Vite)
│   ├── espaco-dellas/             # Site completo Espaço Dellas (React + Vite)
│   └── sorria-clinica-odontologica/# Site Sorria Odontologia
├── docs/
│   ├── integracoes.md             # Documentação técnica dos 3 sistemas integrados
│   ├── operacao.md                # Manual do operador e procedimentos
│   └── decisoes.md                # Architecture Decision Records (ADRs)
├── kits/                          # Kits de conversão, copys e paletas por nicho
│   ├── estruturas-conversao/      # Schemas JSON e estruturas de seções de alta conversão
│   └── landing-pages-kit/         # Paletas de cores e copys por subnicho
├── scripts/                       # Utilitários de teste e validação em TypeScript
│   ├── test_deployer.ts           # Teste de deploy automatizado Vercel
│   └── verify-ui.ts               # Script de verificação de UI com Playwright
├── src/
│   ├── app/
│   │   └── routes.ts              # Rotas da API REST do Prospec
│   ├── client/                    # Frontend SPA (React 18 + Vite 6 + Tailwind v4 + GSAP)
│   │   ├── index.html             # Shell HTML com suporte a dark mode
│   │   └── src/                   # Componentes, templates de nicho e roteamento SPA
│   │       ├── components/        # Componentes UI (AiCopilotDrawer, Skeletons, Charts)
│   │       └── templates/         # 8 Landing pages de nichos de alta conversão
│   ├── domain/
│   │   ├── types.ts               # Contratos e tipos (Lead, Briefing, Prototype, Pitch)
│   │   └── pitchGenerator.ts      # Gerador de abordagens comerciais
│   ├── integrations/
│   │   ├── discoveryAdapter.ts    # Conexão com Google Maps Scraper Kit
│   │   ├── messagingAdapter.ts    # Conexão com OpenWA Baileys Gateway
│   │   └── prototypeAdapter.ts    # Conexão com Doop e motor de protótipos
│   ├── persistence/
│   │   └── database.ts            # Repositório SQLite nativo com índices e queries
│   ├── services/
│   │   ├── aiService.ts           # Motor de IA (Claude Sonnet 5 via GhostCLI / Anthropic)
│   │   ├── doopProcessManager.ts  # Gerenciador de ciclo de vida do Doop Studio
│   │   ├── layoutEngine.ts        # Motor de montagem de layouts
│   │   ├── nicheKits.ts           # Catálogo de dados e seções dos nichos
│   │   ├── nicheRenderer.ts       # Renderizador HTML/CSS de nichos
│   │   ├── serviceRegistry.ts     # Health check e status das portas locais
│   │   ├── siteValidator.ts       # Validador de sites e links
│   │   └── vercelDeployer.ts      # Publicação de sites na Vercel
│   └── index.ts                   # Entrypoint do servidor Express
├── tests/                         # Suíte de testes automatizados (.test.ts e .spec.ts)
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🤝 Créditos & Módulos Integrados

Este projeto utiliza e integra os seguintes repositórios open-source:

* [**`google-maps-scraper-kit`**](https://github.com/Mahanaicoach/google-maps-scraper-kit) &mdash; Desenvolvido por Mahan ([@Mahanaicoach](https://github.com/Mahanaicoach)) &bull; *Licença MIT*
* [**`OpenWA`**](https://github.com/rmyndharis/OpenWA) &mdash; Desenvolvido por Yudhi Armyndharis ([@rmyndharis](https://github.com/rmyndharis)) e contribuidores &bull; *Licença MIT*
* [**`doop`**](https://github.com/kgoedecke/doop) &mdash; Desenvolvido por Kevin Goedecke ([@kgoedecke](https://github.com/kgoedecke)) &bull; *Licença AGPL-3.0*

