# Inventário e Integrações dos Sistemas Locais

Documento de mapeamento técnico dos três projetos que compõem a operação local: **google-maps-scraper-kit**, **OpenWA** e **doop**.

---

## 1. Tabela Comparativa de Integrações

| Sistema | Stack | Entrypoints | Comandos Verificados | Interface Reutilizável | Autenticação | Armazenamento | Efeitos Externos | Limitações |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **google-maps-scraper-kit** | **Engine:** Docker (`gosom/google-maps-scraper` Go).<br>**Scripts:** Python 3 (`scripts/*.py`).<br>**Frontend/Backend:** Next.js 16.4.3, React 19, TypeScript, Drizzle ORM, better-sqlite3.<br>**HTML Legado:** `index.html` + `app.js`. | • Engine: `http://localhost:8080`<br>• Next.js App: `http://localhost:3000`<br>• API Leads: `/api/leads`<br>• API Site Check: `/api/site-check`<br>• Standalone: `index.html` | • `docker compose up -d`<br>• `cd app && npm run dev`<br>• `python scripts/scrape.py` | • Leitura de CSVs (`out/*.csv`)<br>• Rota REST `GET /api/leads`<br>• SQLite `vizinhanca.db`<br>• JSON `site-audits.json` | Nenhuma (vinculado exclusivamente a `localhost`). | • CSVs em `out/`<br>• SQLite em `app/data/vizinhanca.db`<br>• JSON em `app/data/site-audits.json`<br>• `localStorage` no browser | Requisições a endpoints do Google Maps (risco de rate-limit) e requisições HTTP HEAD/GET aos sites consultados. | Motor Docker depende de Docker Desktop ativo. Números de telefone públicos extraídos não implicam consentimento prévio para envio comercial. |
| **OpenWA** | **Framework:** NestJS 11+, Node.js >= 22.19, TypeScript, TypeORM.<br>**Motores:** Baileys (WebSocket direto) e whatsapp-web.js (Chromium via Puppeteer).<br>**Dashboard:** React SPA servido pelo NestJS. | • Gateway HTTP & Dashboard: `http://localhost:2785`<br>• Health: `GET /api/health/ready`<br>• Sessões: `/api/sessions`<br>• Envio: `POST /api/send/text` | • `docker compose up -d`<br>• `npm run prod`<br>• `npm run start:dev` (após npm install) | • API REST na porta 2785<br>• Sessão Baileys existente em `data/sessions/session-435458c1-b96d-4403-bf16-af107425ccb8`<br>• SQLite `openwa.sqlite` | API Key no header `x-api-key` ou `Authorization: Bearer <token>`. Chave gerada em `data/.api-key`. | • SQLite: `data/openwa.sqlite` e `data/main.sqlite`<br>• Sessões: `data/sessions/` e `data/baileys/`<br>• Mídia: `data/media/` | Envio de mensagens reais pela rede do WhatsApp (risco de ban/bloqueio se acionado indevidamente). | Docker Desktop desligado no host e `node_modules` ausente em `OpenWA/`. Adaptador deve operar em modo simulado/mock com detecção automática de porta quando ativo. |
| **doop** | **Backend:** Express, TypeScript, Drizzle ORM, PGlite (@electric-sql/pglite embedded Postgres), WebSocket (`ws`), MCP Server SDK.<br>**Frontend:** React 18, Vite, Tailwind CSS, Radix UI.<br>**Renderização:** Puppeteer-Core, Sharp. | • Express API + MCP: `http://localhost:4400`<br>• Vite Web: `http://localhost:4300`<br>• MCP Endpoint: `/mcp`<br>• Visualização: `/c/:canvasId`<br>• Protótipo: `/c/:canvasId/proto` | • `bun run dev`<br>• `npm run dev` (via tsx e vite)<br>• `docker compose up` | • Servidor MCP (criação de frames, injeção de HTML, screenshots)<br>• Rotas de protótipo `/c/:id/proto`<br>• Funções de prototipação (`prototypeTools.ts`) | Better-Auth (`BETTER_AUTH_SECRET`, cookies de sessão) e tokens de agentes (`agentKeys.ts`). | • Banco PGlite local em `./data/pg` ou Postgres via `DATABASE_URL`<br>• Storage local / S3 para assets | Chamadas opcionais para provedores de IA (Anthropic, OpenAI, Azure, Gemini, OpenRouter) ao gerar designs. | `bun` não disponível no PATH do host Windows; `node_modules` ausente no diretório. Provedores de IA não configurados impedem geração autônoma sem adaptador de templates ou mock. |

---

## 2. Arquivos Comprobatórios de Cada Conclusão

1. **google-maps-scraper-kit**:
   - `google-maps-scraper-kit/CLAUDE.md` (linhas 1–43): Define motor Docker `gosom/google-maps-scraper` na porta 8080, formato do endpoint `/api/v1/jobs` e ausência de autenticação.
   - `google-maps-scraper-kit/docker-compose.yml`: Declaração dos serviços Docker e portas.
   - `google-maps-scraper-kit/app/package.json`: Next.js 16.4.3, React 19, `drizzle-orm`, `better-sqlite3`.
   - `google-maps-scraper-kit/app/src/db/schema.ts`: Tabela SQLite `leads` com campos de status, auditoria e classificação.
   - `google-maps-scraper-kit/app/app/api/leads/route.ts`: Endpoint que lê CSVs de `out/`, aplica normalização, deduplicação por chave (`tel`, `web`, `addr`, `city`) e cache de auditoria.
   - `google-maps-scraper-kit/app.js`: Implementação cliente do prospector com normalização, categorização de presença digital e geração de links `https://wa.me/...`.

2. **OpenWA**:
   - `OpenWA/package.json`: Versão 0.27.0, NestJS, Node >= 22.19, scripts de inicialização.
   - `OpenWA/docker-compose.yml` (linhas 101–105, 423–428, 432–435): Porta 2785 (`API_PORT`), healthcheck em `/api/health/ready`, dashboard SPA embutido no NestJS.
   - `OpenWA/data/.env.generated`: Configuração SQLite `DATABASE_TYPE=sqlite`, storage local `./data/media`, Redis desligado.
   - `OpenWA/data/.api-key`: Chave mestra inicial configurada (`owa_k1_8d8c...`).
   - `OpenWA/data/sessions/` e `OpenWA/data/baileys/`: Sessão ativa `435458c1-b96d-4403-bf16-af107425ccb8`.

3. **doop**:
   - `doop/CLAUDE.md`: Descrição da arquitetura (multplayer design canvas para agentes e humanos, frames que renderizam HTML, MCP server).
   - `doop/package.json`: Versão 0.12.0, Express, PGlite, `@modelcontextprotocol/sdk`, Puppeteer-Core, Vite, Better-Auth.
   - `doop/server/env.ts` (linhas 68–85): Porta padrão 4400 para servidor e `http://localhost:4300` para frontend Vite (`BETTER_AUTH_URL`), banco PGlite em `./data/pg`.
   - `doop/server/prototypeTools.ts` (linhas 1–60): Funções `prototypeUrl(canvasId)`, `setPrototypeStart()`, `prototypeReport()`.
   - `doop/server/mcp.ts` (linhas 47–60): Instruções e ferramentas do MCP (`create_frame`, `set_frame_html`, `get_frame_screenshot`, `set_prototype_start`, `get_prototype`).

---

## 3. Fatos, Decisões e Pendências

### Fatos Confirmados no Código
1. **Repositórios independentes:** `doop`, `google-maps-scraper-kit` e `OpenWA` possuem seus próprios repositórios Git com remotes distintos no GitHub. O diretório raiz `money/` não é um repositório Git.
2. **Dados reais disponíveis:**
   - Scraper possui 1.4 MB de dados reais de leads em `google-maps-scraper-kit/out/rmbh-leads.csv` e `contagem-leads.csv`, além do cache `site-audits.json` com 793 KB.
   - OpenWA possui banco SQLite persistido em `OpenWA/data/openwa.sqlite` (36 MB) e identificador de sessão WhatsApp gravado.
3. **Ambiente de execução local (Windows):**
   - Node.js `v22.19.0`, npm `10.9.3` e Python `3.13.15` estão disponíveis no PATH do sistema.
   - O runtime `bun` não está no PATH.
   - Docker Desktop não está em execução no momento da análise.
   - `node_modules` está instalado em `google-maps-scraper-kit/app`, mas ausente em `OpenWA` e `doop`.

### Repositórios Integrados & Créditos Open-Source
* **google-maps-scraper-kit**: [github.com/Mahanaicoach/google-maps-scraper-kit](https://github.com/Mahanaicoach/google-maps-scraper-kit) &mdash; Mahan (`@Mahanaicoach`) &bull; *Licença MIT*
* **OpenWA**: [github.com/rmyndharis/OpenWA](https://github.com/rmyndharis/OpenWA) &mdash; Yudhi Armyndharis (`@rmyndharis`) &bull; *Licença MIT*
* **doop**: [github.com/kgoedecke/doop](https://github.com/kgoedecke/doop) &mdash; Kevin Goedecke (`@kgoedecke`) &bull; *Licença AGPL-3.0*

### Decisões Arquiteturais para a Fase 0
1. **Aplicação Central `prospec-app/`:** Criar uma nova aplicação monolítica modular na pasta `prospec-app/` (irmã dos outros três projetos), evitando modificar os repositórios originais.
2. **Stack da Central:** Node.js + TypeScript com backend Express e frontend React (Vite) servido na mesma aplicação local (ou rota unificada em porta dedicada, ex: 3333), utilizando banco SQLite dedicado (`operacao.sqlite`) para persistência de dados de negócio.
3. **Padrão de Adaptadores com Fallback Resiliente:**
   - **DiscoveryAdapter (`ScraperAdapter`):** Conecta-se à API de leads do Next.js se ativa ou lê diretamente os arquivos CSV e caches do scraper kit, permitindo importar leads imediatamente sem depender de processos externos.
   - **MessagingAdapter (`OpenWAAdapter`):** Verifica periodicamente se a porta 2785 do OpenWA está respondendo. Se inativa, reporta o serviço como `desconectado`/`offline` e opera em modo simulado seguro, permitindo preencher mensagens sem risco de disparo indesejado.
   - **PrototypeAdapter (`DoopAdapter`):** Verifica a porta 4400 do Doop. Enquanto inativo ou sem chaves de IA, opera com templates de protótipos de alta fidelidade e visualizador HTML em sandbox/iframe integrado à central, gerando URLs de protótipo e screenshots simulados.
4. **Fluxo Unificado de Dados (Sem Copiar/Colar):** O operador seleciona qualquer lead importado; com um clique, os dados (Nome, Telefone, Categoria, Cidade, Status do Site) são injetados automaticamente no fluxo de preparação de WhatsApp e no formulário de briefing de protótipo.

### Pendências e Bloqueios
1. **Docker Desktop:** Para rodar o motor do scraper `gosom/google-maps-scraper` e os containers oficiais do `OpenWA` e `doop`, o Docker Desktop precisa ser inicializado pelo proprietário quando for realizar novas extrações massivas ou sessões completas em container.
2. **Dependências do Doop:** Para executar o servidor completo do Doop no host sem Docker, será necessário instalar o `bun` ou rodar via Node/npm compilado.
3. **Credenciais de Envio e Geração:** O envio real pelo WhatsApp e a geração via IA dependem de autorização explícita do proprietário (conforme regras da spec para fases posteriores). A Fase 0 atende todos os critérios operando em modo seguro/controlado.

