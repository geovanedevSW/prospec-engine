# Registro de Decisões de Arquitetura (ADRs)

Decisões tomadas durante o desenvolvimento da **Fase 0** da Central Local de Operação.

---

## ADR 01: Aplicação de Integração como Projeto Irmão (`prospec-app/`)

* **Contexto:** Os três sistemas (`google-maps-scraper-kit`, `OpenWA` e `doop`) são repositórios Git independentes com commits, remotes e dependências próprias.
* **Decisão:** Manter cada projeto em seu diretório original intacto e criar a central local como um projeto irmão (`prospec-app/`), sem unificar os históricos Git ou alterar arquivos-fonte dos outros projetos sem estrita necessidade.
* **Consequência:** Preserva total rastreabilidade upstream e evita conflitos em atualizações futuras dos módulos.

---

## ADR 02: Uso do `node:sqlite` Nativo do Node.js v22

* **Contexto:** A central roda em ambiente Windows 10 com Node.js v22.19.0. Pacotes como `better-sqlite3` ou `sqlite3` compilam código C++ nativo com `node-gyp`, o que frequentemente gera quebras de compilação em ambientes Windows sem o Visual Studio Build Tools completo.
* **Decisão:** Utilizar a biblioteca nativa `node:sqlite` (`DatabaseSync`), incluída diretamente no Node.js v22.
* **Consequência:** Zero falhas de instalação ou compilação nativa no Windows, inicialização instantânea e persistência SQLite robusta em arquivo único (`data/operacao.sqlite`).

---

## ADR 03: Arquitetura de Porta Única (Porta 3333)

* **Contexto:** A spec requer que o proprietário acesse a central através de um ponto único no navegador via comando único de inicialização documentado.
* **Decisão:** Configurar o backend Express na porta 3333 para responder às rotas da API em `/api/*` e servir o bundle estático do frontend React (Vite SPA) na raiz `/`.
* **Consequência:** O proprietário precisa apenas rodar `npm start` e abrir `http://localhost:3333`, eliminando a necessidade de iniciar separadamente servidores de desenvolvimento de frontend e backend.

---

## ADR 04: Padrão de Adaptadores com Fallback Gracioso

* **Contexto:** O Docker Desktop pode não estar ativo e as dependências completas do Doop e OpenWA podem não estar instaladas no host no momento da execução.
* **Decisão:**
  1. O **DiscoveryAdapter** lê os arquivos CSV estruturados já existentes em `google-maps-scraper-kit/out/` e os caches de auditoria JSON quando o container Docker estiver offline.
  2. O **MessagingAdapter** reconhece sessões em disco e opera em modo simulado seguro com registro completo de mensagens.
  3. O **PrototypeAdapter** fornece um motor gerador embutido de alta fidelidade que renderiza protótipos web responsivos completos em HTML/Tailwind com alternância de viewport (desktop/mobile).
* **Consequência:** A central atende a todos os critérios de dados compartilhados, visualização e persistência da Fase 0 sem ser bloqueada pela falta temporária de serviços externos.

---

## ADR 05: Proteção Contra Disparo Externo Involuntário

* **Contexto:** Disparar mensagens de WhatsApp sem consentimento ou em ambiente de desenvolvimento acarreta risco imediato de banimento da conta do WhatsApp.
* **Decisão:** Implementar a exigência de aprovação manual em duas etapas (Aprovar Conteúdo -> Enviar) e forçar o modo padrão `integrado_sem_envio`, que registra e audita o envio na base sem despachar pacotes externos.
* **Consequência:** Segurança operacional absoluta para o operador durante os testes e a fase de prototipagem.


---

## ADR 06: Gerenciamento do Processo do Doop (`bun run dev`)

* **Contexto:** O Doop necessita do comando `bun run dev` para subir sua interface web na porta 4300 e seu servidor Express na porta 4400. Iniciar os dois projetos em terminais separados adiciona atrito operacional.
* **Decisão:** Criar a classe `DoopProcessManager` na central, que localiza o binário do Bun (`~/.bun/bin/bun.exe`), dispara `bun run dev` automaticamente ao iniciar a central e implementa encerramento em árvore (`taskkill /pid ... /T /F`) ao desligar. Adicionalmente, fornecer rotas de API (`/api/services/doop/*`) e controles na interface para Iniciar, Parar, Reiniciar e consultar logs ao vivo.
* **Consequência:** Experiência com um único comando (`npm start`) para toda a operação local, mantendo o processo Doop monitorado e integrado.

---

## ADR 07: Copilot Estratégico com Claude Sonnet 5 e Diretriz Humanizer

* **Contexto:** Gerar abordagens comerciais e diagnósticos manuais para centenas de negócios locais consome tempo e muitas vezes incorre em abordagens genéricas ou com linguagem artificial de IA (marcada por travessões excessivos, elogios vagos e adjetivos inflados).
* **Decisão:** Integrar o modelo **Claude Sonnet 5** através do proxy GhostCLI (compatível com a Anthropic Messages API), combinando-o com o sanitizador da skill **`humanizer`**:
  1. O operador pode acionar diagnósticos estratégicos automáticos de qualquer lead via drawer lateral ou modal.
  2. As abordagens comerciais no WhatsApp Studio contam com 3 opções geradas sob medida sem vícios de IA (`—`, "nota impecável", etc.), preservando autenticidade brasileira e tom de respeito comercial.
  3. Todo o histórico de conversa com o Copilot é persistido na tabela `ai_copilot_messages` do SQLite local, permitindo continuidade de raciocínio contextual.
* **Consequência:** Aumento exponencial da produtividade do operador comercial com garantia de alta qualidade textual e conformidade com as diretrizes do `GEMINI.md`.
