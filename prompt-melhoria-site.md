# Meta-prompt — gerar o prompt de melhoria do site

> Cole o bloco abaixo inteiro em uma IA (Claude, GPT, Gemini). Ela **não** deve
> mexer no site: ela deve devolver **um prompt** pronto para outra IA executar as
> melhorias.

---

## PAPEL

Você é um diretor de arte digital e engenheiro de front-end sênior, especialista
em sites de moda e em conversão para negócios locais de serviço. Sua tarefa
**não** é reescrever o site. Sua tarefa é **produzir um prompt de execução** —
um briefing completo, acionável e sem ambiguidade — que será entregue a outra IA
com acesso ao código-fonte, para que ela implemente melhorias reais no site
descrito abaixo.

O objetivo não é deixar o site "mais caprichado": é fazer com que ele tenha
**autoria visual** — enquadramento, ritmo e movimento que ninguém confunda com
um template. Leia todo o contexto, decida o que de fato vale mudar e escreva o
prompt final. A seção 5 é o coração do briefing.

---

## 1. O NEGÓCIO E A MARCA

**Verônica Chaves — Assessoria de Moda** (perfil público: `@moda_bh_vero`),
Belo Horizonte/MG.

- **O que vende:** assessoria/consultoria de moda **B2B**. O cliente é o
  **lojista** — dono(a) de loja de roupas que precisa montar a "arara" (o mostruário
  da loja) da temporada. A Verônica faz a curadoria peça por peça, no atacado,
  para o perfil da loja e das clientes dela.
- **Diferenciais reais (não inventar outros):** curadoria personalizada,
  atendimento presencial em BH **ou** online, envio gratuito para todo o Brasil,
  9 marcas na curadoria da temporada (Anne Fernandes, Caos, Fruta Cor, Iorane,
  LN, Regina Salomão, Skazi, Thamara Capelão, Tufi Duek).
- **Frase da marca:** "A moda é uma ferramenta poderosa para transmitir mensagens
  e abrir portas."
- **Headline atual do hero:** "A arara que a sua cliente *não resiste*."
- **Objetivo único do site:** levar o lojista para uma **conversa no WhatsApp**
  (`5531997433369`). Não há e-commerce, carrinho, checkout, login de cliente nem
  formulário de lead. Todo CTA termina no WhatsApp, com mensagem pré-preenchida
  por contexto (agendar consultoria / pedir catálogo / "quero este look X").
  O Instagram é o CTA secundário.
- **Tom de voz:** português do Brasil, primeira pessoa da Verônica, íntimo e
  profissional. Vocabulário de moda ("arara", "curadoria", "temporada",
  "prancha", "look"), sem jargão de marketing e sem exagero publicitário.

---

## 2. CONCEITO VISUAL

O conceito de direção de arte se chama **"Ladrilho & Sol"**: o site é um
**lookbook impresso**. A capa é espresso (quase preto), as seções seguintes são
"pranchas" fotográficas ensolaradas, o ouro das joias é a cor de ação e o
ladrilho da beira da piscina é a textura de fundo das pranchas escuras.
**Toda cor do site foi extraída da fotografia da coleção** — nada é arbitrário.

### Paleta de marca (tokens em `web/app/globals.css`)

| Token | Hex | De onde veio | Papel |
|---|---|---|---|
| `--color-espresso` | `#17110d` | malha chocolate e sombras da foto | fundo das seções escuras ("capa") |
| `--color-espresso-alto` | `#221a14` | — | superfície elevada sobre o espresso |
| `--color-areia` | `#ede5d6` | o linho das peças | fundo claro padrão / texto sobre escuro |
| `--color-areia-fundo` | `#dfd6c4` | prancha ensolarada, tom mais fechado | fundo claro alternado |
| `--color-areia-clara` | `#f7f3ea` | — | quase branco, fundo da faixa de marcas |
| `--color-ouro` | `#c9962f` | as joias | **ação sobre fundo escuro** |
| `--color-bronze` | `#7a5a16` | ouro fechado | **ação sobre fundo claro** (contraste AA) |
| `--color-piscina` | `#8fb3ae` | o mar ao fundo das fotos | cor de apoio, uso raro |

Semânticos (`--color-text-primary`, `--color-accent`, `--color-line`,
`--color-ground`, `--color-surface`, `--color-on-accent`…) derivam desses.
Há também estados: `--color-success #2e7d5c`, `--color-warning #c9a047`,
`--color-error #a24949`, `--color-info #4a7ba7`.

### Sistema de contexto tonal (regra central da arquitetura CSS)

Cada seção declara em que "prancha" está — `.tom-escuro`, `.tom-claro` ou
`.tom-claro-fundo` — e **os tokens semânticos se remapeiam sozinhos**. Em
`.tom-escuro`, `--color-accent` vira ouro e o texto vira areia; em contexto claro,
o accent vira bronze. **Componentes só falam com a camada semântica** e
funcionam nos dois fundos, sem exceção por seção. Qualquer melhoria proposta tem
de respeitar isso: nunca hard-codar hex em componente, nunca criar regra do tipo
`.secao-x .btn { color: ... }`.

Ritmo tonal atual das seções: hero **escuro** → faixa de prova **escura** →
Tendências **escura + ladrilho** → Como funciona **clara** → Marcas **clara-fundo**
→ Sobre **clara** → Contato **escura + ladrilho** → rodapé **escuro**.

### Tipografia

- **Display:** Bodoni Moda (didone — a letra de manchete de revista de moda),
  `--font-serif-display`, usada em h1–h4, com itálico para ênfase dentro do título.
- **Corpo/utilitário:** Jost (grotesca geométrica, linhagem Futura),
  `--font-sans-body`. Rótulos ("eyebrow"), navegação e botões em CAIXA ALTA com
  `letter-spacing: 0.22em` (botões `0.14em`).
- Escala display fluida com `clamp()` (até `6.5rem`), `line-height: 0.98`,
  `letter-spacing: -0.018em`. Ambas auto-hospedadas por `next/font` (sem CDN).

### Forma e movimento

- **Raios quase zero** (`--radius-sm: 2px` é o padrão): é impresso, não é app.
- Espaçamento base 8pt, container `1240px`, transição
  `320ms cubic-bezier(.22,1,.36,1)`.
- Movimento: scroll-reveal com stagger, hover que troca a foto do look pela foto
  alternativa, carrossel infinito de logos das marcas. Regra declarada:
  **nada pisca, nada repete em laço** — e tudo respeita
  `prefers-reduced-motion`, com os estados ocultos só ativos quando o JS marca
  `.reveal-enabled`.

---

## 3. ESTRUTURA E STACK

Aplicação de produção em `web/`: **Next.js 15.5 (App Router) + React 19 +
TypeScript**, CSS puro com custom properties (**sem Tailwind, sem CSS-in-JS, sem
biblioteca de UI**), `sharp` para imagens. Node 22/24. Sem framework de teste
além do `node --test`.

```
web/
  app/layout.tsx        fontes, metadata/OG, themeColor, force-dynamic (CSP com nonce)
  app/page.tsx          composição da home
  app/globals.css       tokens + base + contexto tonal (≈380 linhas)
  app/sections.css      todas as "pranchas" e componentes de página (≈970 linhas)
  app/animations.css    scroll-reveal, stagger, carrossel (≈210 linhas)
  app/admin/            painel autenticado (sessão scrypt + cookie HttpOnly + CSRF)
  components/site/      Header, Hero, Trends, HowItWorks, Brands, About,
                        Contact, Footer, WhatsAppButton, ScrollReveal,
                        ConsentAnalytics
  components/ds/        Button, Input, Badge, Card + ds.css (usados pelo /admin)
  lib/                  links.ts (WhatsApp/Instagram), trends.ts, catalog.ts,
                        validation.ts, github.ts
  data/trends.json      coleção editável pelo /admin ("Verão 2026", 6 looks)
  public/imgs/          capa.jpg, veronica.jpg, 0001..0006 (+ variantes -alt),
                        logos das 9 marcas, ícones insta/ws
```

Seções da home, na ordem: **Header** (sticky, transparente sobre a capa, sólido
com blur ao rolar, menu hambúrguer no mobile) → **Hero** (foto de capa + véu,
eyebrow, h1, subtítulo, 2 CTAs, link do Instagram, "Edição Verão 2026") →
**faixa de prova** (Grátis / BH + online / 9 marcas) → **Tendências** (grade de
6 looks; cada card leva ao WhatsApp com o nome do look na mensagem) →
**Como funciona** (3 passos numerados) → **Marcas** (carrossel de 9 logos) →
**Sobre** (foto + bio da Verônica) → **Contato** (2 CTAs grandes) → **Footer** +
botão flutuante de WhatsApp + banner de consentimento.

Medição: Google Analytics `G-F7VFWPM4LR` e Google Ads `AW-11184553318` com
rótulo de conversão, carregados **só após aceite** no banner (Consent Mode v2,
tudo `denied` por padrão). Existe `npm run verificar:medicao`.

Segurança já implementada (não regredir): CSP com nonce por requisição,
imagens do admin reencodadas em WebP sem EXIF, token do GitHub só no servidor.

Validação obrigatória: `npm test`, `npm run lint` (`--max-warnings=0`),
`npm run typecheck`, `npm run build`.

---

## 4. RESTRIÇÕES QUE O PROMPT FINAL DEVE CARREGAR

1. Não introduzir Tailwind, styled-components, shadcn, Framer Motion nem
   qualquer dependência nova sem justificativa forte — o CSS é artesanal e
   tokenizado de propósito.
2. Não hard-codar cor: só tokens. Não quebrar o sistema `.tom-*`.
3. Não trocar as fontes nem o conceito "Ladrilho & Sol" — mas **reinterpretar
   o conceito com ousadia é obrigatório**, não opcional (ver seção 5). O que
   está travado é a paleta, a dupla tipográfica e a ideia de lookbook impresso.
   Enquadramento, grade, escala, ritmo e movimento estão todos em aberto.
4. Não inventar dados de negócio (preços, prazos, número de clientes,
   depoimentos, prêmios). Se um bloco novo exigir conteúdo real, deixar
   placeholder explícito e listar o que a Verônica precisa fornecer.
5. Não regredir acessibilidade (contraste AA, foco visível, skip-link,
   `prefers-reduced-motion`, alt text), performance (LCP é a foto de capa) nem
   a CSP/consentimento.
6. Todo caminho de conversão continua terminando no WhatsApp com mensagem
   contextual — não criar formulário de lead sem backend.
7. Português do Brasil em textos, nomes de classe e comentários, seguindo a
   convenção do código existente (`.secao-*`, `.look-card`, `--color-*`).

---

## 5. AMBIÇÃO CRIATIVA (a parte mais importante)

O site de hoje é competente e **previsível**: seções empilhadas de largura
total, cabeçalho + título + conteúdo centralizado, grade regular de 3 colunas,
fade-up ao rolar. Funciona, mas poderia ser de qualquer consultora de qualquer
cidade. O prompt que você escrever precisa **exigir autoria**, não polimento.

Trate o executor como diretor de arte, não como faxineiro de CSS. Peça a ele que:

**Reenquadre o layout.** Um lookbook impresso não empilha retângulos iguais: ele
tem página dupla, sangria, imagem que atravessa a dobra, texto que corre na
margem, número de prancha no canto. Explore — e escolha, com justificativa —
coisas como grade editorial assimétrica, imagem em sangria total contra bloco de
texto estreito, tipografia em escala de cartaz, sobreposição de foto e manchete,
scroll horizontal na vitrine de looks, seção sticky com conteúdo que troca ao
lado, colunas de larguras diferentes, texto vertical na margem, o ladrilho usado
como grade real de composição e não só como textura de fundo. Não é para aplicar
tudo: é para escolher **dois ou três gestos fortes** e levá-los até o fim.

**Crie um vocabulário de movimento próprio.** Fade-up genérico é o default de
template; substitua por movimento que signifique alguma coisa dentro do conceito.
Ideias a considerar (e superar): revelação por máscara, como página virando ou
cortina de luz passando; imagem com parallax leve dentro do próprio quadro;
manchete que entra por clip-path linha a linha; transição entre prancha clara e
escura ancorada no scroll; hover do look que se comporta como folhear a peça em
vez de trocar a imagem seca; número da prancha que conta conforme a seção entra;
o CTA do WhatsApp com um estado de hover que valha ser tocado. Regras que
continuam valendo: nada pisca, nada repete em laço eterno, tudo tem versão
estática sob `prefers-reduced-motion`, nada de layout shift, e movimento
preferencialmente com `transform`/`opacity` e IntersectionObserver — o mesmo
motor de `animations.css`, sem biblioteca nova.

**Assuma risco com critério.** Cada gesto ousado precisa vir com: por que serve
à marca, como se comporta no celular, como degrada sem JS, e qual o custo de
performance. Ousadia que quebra o LCP ou a leitura no mobile é erro, não coragem.

**Peça alternativas, não uma solução única.** O prompt final deve mandar o
executor propor **de 2 a 3 direções de reenquadramento distintas** para o hero e
para a vitrine de Tendências — descritas em texto com wireframe em ASCII ou
lista de camadas — antes de escrever CSS, e só então implementar a escolhida.

## 6. O QUE VOCÊ DEVE ENTREGAR

Escreva **um único prompt de execução**, em português, pronto para copiar e
colar em uma IA com acesso ao repositório. Esse prompt deve conter:

1. **Contexto condensado** da marca, da paleta e das regras acima — o executor
   não terá este briefing, então o essencial precisa estar dentro do prompt.
2. **Uma direção criativa declarada** — o executor deve abrir o trabalho
   nomeando o gesto autoral que vai perseguir (uma frase, tipo "a página se lê
   como uma revista aberta: sangria à esquerda, coluna de texto estreita à
   direita, número de prancha na margem"), e depois implementá-lo com
   consistência em todas as seções, não só no hero.
3. **As 2–3 direções alternativas** de reenquadramento pedidas na seção 5, com
   wireframe textual, antes de qualquer CSS.
4. **Diagnóstico priorizado** das melhorias, ordenado por impacto ÷ esforço,
   cobrindo pelo menos — reenquadramento visual e sistema de movimento (itens
   de primeira classe, não "polimento final"); conversão e hierarquia do hero;
   prova social e credibilidade (hoje o site não tem nenhum depoimento ou caso);
   a jornada até o WhatsApp; a seção de Tendências como vitrine; responsividade
   e o mobile (a maior parte do tráfego de moda vem do Instagram, no celular);
   performance e Core Web Vitals; SEO local ("assessoria de moda BH", JSON-LD
   `LocalBusiness`, sitemap, robots); acessibilidade; e refinamento tipográfico
   editorial. Para cada item: **problema → mudança concreta → arquivo(s) →
   critério de aceite verificável**.
5. **Separação explícita** entre (a) o que é ajuste de código, (b) o que
   depende de conteúdo/fotos que só a Verônica pode fornecer e (c) o que é
   hipótese a testar.
6. **Regras de execução** para o executor: mudanças incrementais e revisáveis,
   um tema por vez, sem refatoração ampla não solicitada, rodando
   `npm run lint && npm run typecheck && npm run build` a cada etapa, e
   descrevendo o antes/depois de cada seção tocada — inclusive o raciocínio de
   direção de arte, não só o diff.
7. **Critérios de "pronto"** objetivos ao final, incluindo um teste de autoria:
   *se este layout pudesse ser trocado pelo de qualquer outra consultora de moda
   sem ninguém notar, ele não está pronto.*

Formato da sua resposta: **apenas o prompt final**, em Markdown, dentro de um
único bloco de código. Sem comentários seus antes ou depois. Se algo do
briefing for ambíguo, resolva com a interpretação mais conservadora e registre
a suposição dentro do próprio prompt, numa seção "Suposições".
