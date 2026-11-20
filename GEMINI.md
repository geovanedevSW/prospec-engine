# Diretrizes de Front-end, UI, UX e Design

Para qualquer criação, prototipação, alteração ou revisão de layout, interface e experiência do usuário neste workspace:

## 1. Uso Obrigatório das Skills de Design
Antes de decidir layout, tipografia, paleta, componentes ou animações, consulte e aplique ativamente as instruções das skills instaladas em `.agents/skills/`:
* **`impeccable`**: Auditoria de contraste, hierarquia de informação, ergonomia de tela, acessibilidade, responsividade e eliminação de vícios visuais ("AI slop").
* **`emilkowalski/skills` (`emil-design-eng`, `animate`, `review-animations`)**: Engenharia de design de alto padrão (Vercel/Linear), microinterações funcionais, tempos de animação rápidos (< 300ms) e curvas com propósito.
* **`ui-ux-pro-max-skill` (`ui-ux-pro-max`, `design-system`)**: Arquitetura de design tokens, paletas curadas com funções estritas e pareamentos tipográficos intencionais.
* **`blader/humanizer` (`humanizer`)**: Eliminação de padrões e vícios textuais de IA em copys, títulos, chamadas e microtextos (elimina fórmulas como "não apenas X, mas Y", tríades forçadas, pontuação/travessões excessivos, hipérboles vazias e linguagem artificial de vendas).

## 2. Princípios de Execução de Layout
1. **Entendimento do Negócio:** Cada tela deve refletir a identidade, o público e o objetivo prático de conversão do negócio em questão.
2. **Anti-Template & Anti-Clichê:** Proibido o uso de interfaces genéricas de IA (como gradientes roxo/azul sobre branco, cards excessivamente aninhados, sombras borradas gratuitas ou elementos puramente decorativos).
3. **Tipografia & Contraste:** Uso de fontes display com forte personalidade pareadas com fontes de leitura neutras e limpas, garantindo alto contraste de escala e legibilidade sem esforço.
4. **Cores Rigorosas:** Definir uma cena/mood tangível: 1 cor de fundo (*ground*), 1 cor de destaque (*accent*) e tons neutros de suporte derivados do mesmo ambiente físico.
5. **Animações com Propósito:** Apenas transições que orientem o olhar ou forneçam feedback imediato. Sempre respeitar `prefers-reduced-motion`.
6. **Conteúdo 100% Realista:** Sem *lorem ipsum* ou textos de preenchimento; dados, preços e marcas autênticos.
7. **Validação Multi-resolução:** Sempre projetar e validar o comportamento responsivo em Desktop (`1280px`) e Mobile (`390px`), reportando o que foi efetivamente testado.
8. **Ícones Vetoriais Obrigatórios (Proibido Emojis):** Nunca usar emojis como ícones ou marcadores de interface (ex: proíbido 📞, 📍, 🗺️, ✂, 💅, ✨). Sempre utilizar SVGs inline limpos ou da biblioteca oficial (Lucide, Tabler, Heroicons), com `stroke-width` (1.5px a 2px) e proporções consistentes, preservando o acabamento profissional de software/design e evitando aparência amadora de emojis do sistema operacional.

## 3. Padrão de Prototipação no Doop (Estudo de Caso & Referência: Espaço Dellas)

Para geração de protótipos de alta conversão para negócios locais no Doop:

### A. Estrutura Obrigatória do Canvas
O canvas deve ser sempre organizado em 4 colunas para inspeção modular e apresentação completa:
1. **Coluna 1 — Seções Modulares Desktop (`1280px`):** Pranchetas isoladas para cada bloco (`01 Header & Hero`, `02 Procedimentos`, `03 Sobre`, `04 Avaliações`, `05 Localização & Footer`).
2. **Coluna 2 — Desktop Completo (`1280px`):** A página inteira integrada do topo ao rodapé, com altura dimensionada sem cortes (`~4250px`).
3. **Coluna 3 — Seções Modulares Mobile (`390px`):** Pranchetas isoladas verticais para validação rápida no celular (`M01` a `M05`).
4. **Coluna 4 — Mobile Completo (`390px`):** A página móvel contínua (`~2700px`), sempre com a **Sticky Action Bar** inferior fixa para conversão com 1 toque no WhatsApp.

### B. Referência do Protótipo Aprovado (Espaço Dellas Ana Paula Pereira)
* **Canvas Oficial:** `/c/y0KxNx4WuX`
* **Design Tokens Aplicados:**
  * **Ground (Fundo):** `#FAF8F5` (Off-white quente / linho acolhedor)
  * **Accent (Ação/Destaque):** `#8A3D4D` (Rosé Veludo / Marsala com alto contraste > 5.5:1)
  * **Neutros:** Texto `#1C1917`, Secundário `#57534E`, Borda `#E8E2D9` (1px sólido)
  * **WhatsApp:** `#128C7E` / `#25D366`
  * **Tipografia:** *Playfair Display* (Títulos/Editorial) + *Inter* (Corpo/Interface)
* **Pranchetas Registradas no Doop:**
  * **Desktop Completo:** `2fZ0tL_3Ao` (`1280px × 4250px`)
  * **Mobile Completo:** `YtK8KsPl1H` (`390px × 2700px`)
  * **Seções Modulares Desktop:**
    * `01 — Header & Hero`: `vmtCKBjIHY` (`1280px × 820px`)
    * `02 — Procedimentos & Cardápio`: `NLsGji6sbj` (`1280px × 840px`)
    * `03 — Sobre a Ana Paula & Espaço`: `yfCL8QtnWS` (`1280px × 740px`)
    * `04 — Avaliações Google 4.9★`: `URQFSKD44f` (`1280px × 560px`)
    * `05 — Localização, Horários & Footer`: `wDXydxf_WB` (`1280px × 840px`)
  * **Seções Modulares Mobile:**
    * `M01 — Header & Hero (Mobile)`: `pQLUChNFw6` (`390px × 680px`)
    * `M02 — Procedimentos (Mobile)`: `7A7ulqoxdw` (`390px × 620px`)
    * `M03 — Sobre a Ana Paula & Espaço (Mobile)`: `1RRyB4UwYM` (`390px × 640px`)
    * `M04 — Avaliações Google 4.9★ (Mobile)`: `qGf4Kl1kkH` (`390px × 520px`)
    * `M05 — Localização, Horários & Footer (Mobile)`: `Z1TXWn8HWM` (`390px × 580px`)

## 4. Regra Anti-Corte e Dimensionamento Obrigatório com Playwright (Zero Scrollbars, Zero Espaço Morto)

É ESTRITAMENTE PROIBIDO estimar ou fixar alturas de pranchetas de forma empírica no Doop.
Para qualquer alteração de prancheta modular ou página completa:

1. **Medição Dinâmica com Playwright:** A altura de cada prancheta (`height`) DEVE ser medida programaticamente via Playwright headless na largura exata da prancheta (Desktop `1280px` ou Mobile `390px`), avaliando `document.body.scrollHeight` e `document.documentElement.scrollHeight` após o carregamento completo do HTML, fontes e imagens (`fonts.ready`).
2. **Buffer de Segurança Anti-Scrollbar:** Adicionar de `4px` a `8px` ao valor medido para neutralizar qualquer sub-pixel rounding do navegador que possa disparar barras de rolagem internas indesejadas no iframe do Doop.
3. **Cálculo Sequencial de Posicionamento Y:** Os eixos verticais (`y`) das seções modulares (Coluna 1 e Coluna 3) devem ser calculados dinamicamente: `y_atual = y_anterior + height_anterior + gap` (gap padrão = 60px), impedindo sobreposições ou distâncias inconsistentes entre as pranchetas no canvas.
4. **Verificação Visual Obrigatória:** Toda exportação ou entrega deve ser inspecionada via captura de imagem para certificar:
   - Nenhuma linha de texto, card, mapa, botão ou formulário cortado na borda inferior.
   - Nenhuma barra de rolagem interna vertical nas pranchetas modulares do Doop.
   - Nenhum vácuo ou espaço vazio excessivo abaixo do rodapé final.

## 5. Regra Anti-Quebra de Linha em CTAs (Zero Quebra em Botões)

É ESTRITAMENTE PROIBIDO permitir quebra de linha em textos de botões, links de ação ou CTAs (`white-space: nowrap`).
1. **Obrigatoriedade de `white-space: nowrap`:** Todo botão, link de ação ou CTA (`.btn-whatsapp`, `.btn-secondary`, links de cards e action bars) deve conter explicitamente `white-space: nowrap;` e `flex-shrink: 0;`.
2. **Copy Concisa e Proporções em Ações Lado a Lado:** Quando dois botões dividirem o mesmo container (ex: "Como chegar" + "Agendar pelo WhatsApp"), a copy deve ser direta e os paddings/gaps calibrados para que caibam sem aperto. O container deve usar `display: flex; gap: 12px; align-items: center; flex-wrap: wrap;` de modo que, se a largura for reduzida, o segundo botão desça por inteiro em bloco único, NUNCA quebrando o texto interno do botão em duas linhas.
3. **Inspeção Visual de CTAs:** Toda inspeção visual deve validar que 100% dos botões possuem seu rótulo em linha única, legível e com respiro ergonômico.




