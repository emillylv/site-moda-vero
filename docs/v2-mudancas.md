# v2 — o que mudou (mapa para a v3)

> Companheiro de `docs/v2-direcao-de-arte.md` (a direção e as alternativas).
> Este arquivo é o **inventário técnico**: o que foi tocado, o que **não** foi,
> e onde estão as armadilhas.

---

## 1. Zona intocada — não precisa reauditar

Nada disto foi alterado na v2:

- `web/middleware.ts` — CSP com nonce, headers.
- `web/next.config.mjs` — headers de segurança.
- `web/app/admin/**`, `web/app/api/**`, `web/components/admin/**`,
  `web/components/ds/**` — painel, API e design system do admin.
- `web/lib/security/**`, `web/lib/server/**`, `web/lib/catalog.ts`,
  `web/lib/validation.ts`, `web/lib/github.ts`.
- `web/components/site/ConsentAnalytics.tsx` — consentimento e medição
  (GA `G-F7VFWPM4LR` / Ads `AW-11184553318`) seguem idênticos.
- `web/components/site/Footer.tsx`, `WhatsAppButton.tsx` (só o CSS mudou).
- `web/data/trends.json`, `web/package.json`, testes.
- A **paleta**, a **dupla tipográfica** e o sistema `.tom-*`: intactos.
  Nenhum hex novo foi hard-codado; nenhuma regra `.secao-x .btn { … }` existe.

**Nenhuma dependência foi adicionada.** `package.json` está byte a byte igual.

---

## 2. Arquivos novos

| Arquivo | Papel |
|---|---|
| `web/app/robots.ts` | `/robots.txt` — `disallow` de `/admin` e `/api`, aponta o sitemap. **`force-dynamic`** (ver armadilha 3). |
| `web/app/sitemap.ts` | `/sitemap.xml` — só a home. **`force-dynamic`**. |
| `web/components/site/DadosEstruturados.tsx` | JSON-LD `ProfessionalService` com o nonce da CSP. Só dado verificável. |
| `web/components/site/Folio.tsx` | O folio da margem (número + fio + rótulo vertical). `aria-hidden`. |
| `web/components/site/Testimonials.tsx` | Prancha de depoimentos. Devolve `null` se não houver dado. |
| `web/lib/depoimentos.ts` | Tipo + leitura + filtro de entradas incompletas. |
| `web/data/depoimentos.json` | **Vazio (`[]`)** de propósito. |
| `docs/v2-direcao-de-arte.md` | Direção, alternativas com wireframe, diagnóstico. |
| `docs/v2-mudancas.md` | Este arquivo. |

## 3. Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `web/app/globals.css` | Tokens novos: `--folio-largura`, `--folio-gap`, `--margem-prancha`. Sistema `.prancha` / `.folio` + responsivo. `font-kerning`/ligaduras no `body`. `.cabecalho-secao` perdeu `max-width`/`margin auto` (quem mede agora é a grade da prancha). |
| `web/app/sections.css` | Hero "capa com dobra"; vitrine escalonada de 12 colunas; sangria do retrato e do carrossel; Contato alinhado à esquerda; estilos de depoimento; hover do FAB; `.btn-seta`; CTA de largura cheia no celular. |
| `web/app/animations.css` | Vocabulário novo: cortina, manchete linha a linha, folio (fio + contador), parallax por `animation-timeline: view()`. Stagger diagonal na vitrine. |
| `web/app/layout.tsx` | Só `metadata` (título, description, keywords, canonical, OG/Twitter, robots). Fontes, `viewport` e `force-dynamic` inalterados. |
| `web/app/page.tsx` | Numeração das pranchas, `<Testimonials>`, `<DadosEstruturados>`. |
| `web/lib/links.ts` | `+ WHATSAPP_TELEFONE_E164` (para o JSON-LD). Número e mensagens iguais. |
| `Hero.tsx` | Estrutura `.hero-prancha` + `<Folio>`; manchete em 4 linhas explícitas; `.hero-dobra`; `width`/`height` na capa. |
| `Trends.tsx` | Envolvido em `.prancha` + `<Folio>`; recebe `numeroPrancha`; índice antes do título; `width`/`height` nas fotos. |
| `HowItWorks.tsx`, `Brands.tsx`, `About.tsx`, `Contact.tsx` | Envolvidos em `.prancha` + `<Folio>`; recebem `numeroPrancha`. `About` ganhou `.sobre-foto-quadro`. |
| `Header.tsx` | `Esc` fecha o menu; rolagem do corpo travada com o menu aberto. |
| `ScrollReveal.tsx` | Observa `.folio` além de `.reveal`; contador do número da prancha. |

---

## 4. Armadilhas — leia antes de mexer

**1. O `clip-path` da cortina fica na `img`, nunca no elemento observado.**
O IntersectionObserver considera um elemento totalmente recortado como fora de
vista. Na primeira versão a cortina estava no próprio `.reveal` e a foto do
"Sobre" **nunca aparecia** — nem depois de rolar por cima dela. Se for criar
outra revelação por máscara, aplique o recorte num filho.

**2. Estado oculto só sob `.reveal-enabled`.**
`.look-card` tinha `opacity: 0` solto no CSS (herdado da v1): sem JS, os seis
looks ficavam invisíveis. Agora está sob `.reveal-enabled .look-card`. Qualquer
estado inicial escondido precisa desse prefixo.

**3. `robots.ts` e `sitemap.ts` precisam de `force-dynamic`.**
Sem isso o Next pré-renderiza no build e congela a `SITE_URL` daquele momento —
o sitemap saía com `localhost:3000` e o robots sem a linha `Sitemap:`.

**4. Toda sangria sai de `--margem-prancha`.**
`max(--spacing-xl, (100vw - --container-max)/2)`. Não escreva px na mão para
"encostar na borda": em tela larga a conta muda.

**5. `ch` não serve para medir a coluna do hero.**
A unidade resolve contra a fonte do elemento (Jost, corpo), não contra a
manchete — `30ch` virou ~260px. A coluna usa `--coluna-tipo` em px e a dobra é
calculada a partir dela.

**6. Reveals laterais viram verticais abaixo de 760px** (`animations.css`),
senão os 26px de deslocamento empurram a coluna para fora da margem.

---

## 5. Verificado nesta entrega

- `npm test` (5 passam), `npm run lint` (`--max-warnings=0`),
  `npm run typecheck`, `npm run build` — todos verdes.
- `/robots.txt` e `/sitemap.xml` servidos com a `SITE_URL` de execução;
  JSON-LD renderizado com nonce e sem dado inventado.
- Chrome headless a 1440px e a 390px: geometria conferida por CDP.
  - retrato do "Sobre" com `left = 0` (sangria até a borda) em 1440px;
  - **sem vazamento horizontal no celular** (`scrollWidth == clientWidth`);
  - 6 folios revelados, 6 cards em vista, cortina abrindo.
- `prefers-reduced-motion` deixa a página inteira estática e legível
  (foi assim que as capturas de conferência foram feitas).

## 6. O que falta — só a Verônica pode fornecer

1. **Depoimentos** → `web/data/depoimentos.json` (nome, loja, cidade, texto).
   Enquanto estiver `[]`, a prancha não existe no DOM.
2. **Endereço e horário** em BH → completam o JSON-LD para busca local.
3. **Recorte vertical da capa** para o celular.
4. **Fotos de araras montadas** em loja de cliente.
