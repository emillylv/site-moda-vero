# v2 — Direção de arte e plano de execução

> Documento de acompanhamento da **versão 2** do site (Verônica Chaves —
> Assessoria de Moda). Escrito antes do CSS, como exige a seção 5 do
> `prompt-melhoria-site.md`: primeiro as direções alternativas de
> reenquadramento, depois a escolha justificada, só então o código.
>
> **Para quem for fazer a v3:** o que a v2 mexeu está listado em
> `docs/v2-mudancas.md`. Nada de paleta, tipografia, CSP, consentimento,
> `/admin` ou medição foi alterado.

---

## 1. Direção declarada

> **A página se lê como uma revista aberta: cada seção é uma prancha numerada,
> com uma margem viva à esquerda que carrega o número e o fio, imagem que sangra
> para fora da grade e coluna de texto estreita correndo ao lado.**

O conceito "Ladrilho & Sol" não muda — muda o **enquadramento**. Hoje o site
empilha retângulos de largura total, todos com cabeçalho centralizado e grade
regular. Um lookbook impresso não faz isso: ele tem folio, margem, sangria e
dobra. A v2 persegue três gestos e os leva até o fim **em todas as seções**,
não só no hero.

### Gesto 1 — A margem de prancha (folio)

Uma faixa vertical à esquerda de cada seção, com o número da prancha
(`01`…`08`) em didone grande, um fio de 1px que desce a altura da seção e o
rótulo em texto vertical. É o elemento que costura a página inteira e o que
torna o layout impossível de confundir com template: nenhum gerador de site
coloca folio de revista na margem.

- **Por que serve à marca:** transforma cada seção numa prancha de lookbook.
- **Mobile:** a margem colapsa para uma linha horizontal fina acima do título
  (número + fio + rótulo), sem texto vertical.
- **Sem JS:** é CSS puro, sempre visível.
- **Custo:** zero — pseudo-elementos e um `<p>` por seção.

### Gesto 2 — Sangria assimétrica

Quebra da largura única. O hero ganha uma **dobra**: painel espresso à esquerda
com o tipo em escala de cartaz, fotografia sangrando à direita até a borda do
viewport, e a palavra em itálico da manchete **atravessando a dobra** para
dentro da foto. Tendências vira grade editorial escalonada (colunas de larguras
diferentes, deslocamento vertical), não 3 colunas iguais. Sobre sangra a foto
para fora do container.

### Gesto 3 — Vocabulário de movimento próprio

Fade-up genérico sai. Entram:

- **Cortina de luz** (`clip-path` de baixo para cima) para blocos de imagem —
  a prancha sendo descoberta.
- **Manchete linha a linha**, cada linha subindo por dentro da própria máscara,
  como tipo caindo na página.
- **Contador de prancha**: o número do folio conta de `00` até o número da
  seção quando ela entra em quadro. Conta uma vez, não repete.
- **Parallax curto** dentro do próprio quadro da foto (máx. 24px, via
  `transform`), nunca no LCP.

Regras mantidas: nada pisca, nada repete em laço, tudo tem versão estática sob
`prefers-reduced-motion`, sem layout shift, só `transform`/`opacity` +
IntersectionObserver, sem biblioteca nova.

---

## 2. Direções alternativas de reenquadramento

### 2.1 HERO

#### Direção A — "Capa com dobra" ✅ ESCOLHIDA

```
┌──────────────────────────────────────────────────────────────┐
│ │  Verônica Chaves                          Coleção  Sobre ⌄ │
│ │                                                            │
│ P│ ─── ASSESSORIA DE MODA · BH                               │
│ R│                                              ╔═══════════╗│
│ A│  A arara                                     ║           ║│
│ N│  que a sua                                   ║   FOTO    ║│
│ C│  cliente                                     ║  sangra   ║│
│ H│      ┌───────────────────────────────────────╫─ até a ───╫│
│ A│      │ não resiste.  ← itálico atravessa     ║   borda   ║│
│  │      └───────────────────────────────────────╫───────────╫│
│ 0│                                              ║           ║│
│ 1│  Consultoria personalizada para lojistas:    ║           ║│
│ ││  peças a dedo, envio grátis.                 ║           ║│
│ ││                                              ║           ║│
│ E│  [ AGENDAR CONSULTORIA ]  [ VER A COLEÇÃO ]  ║           ║│
│ D│  @moda_bh_vero                               ╚═══════════╝│
│ Ç│                                                            │
└──────────────────────────────────────────────────────────────┘
   ↑ folio vertical: PRANCHA 01 · EDIÇÃO VERÃO 2026
```

Camadas: (1) foto em sangria à direita, (2) véu espresso assimétrico que firma
a coluna esquerda, (3) folio vertical na margem, (4) coluna de tipo estreita,
(5) a palavra em itálico da manchete em escala maior, deslocada para a direita,
sobrepondo o começo da foto.

- **Por quê:** é o único que dá **autoria** sem abrir mão da fotografia como
  protagonista. A dobra é o gesto literal do lookbook impresso.
- **Mobile:** a dobra colapsa — foto em sangria total, véu de baixo para cima,
  tipo ancorado embaixo (comportamento atual, que já funciona), folio vira
  linha horizontal.
- **Sem JS:** idêntico; só o movimento de entrada não roda.
- **LCP:** a foto continua sendo o LCP, `fetchPriority="high"`, sem lazy. Em
  desktop ela renderiza numa área **menor** que a atual, então o custo cai.

#### Direção B — "Manchete sobre a sangria"

```
┌──────────────────────────────────────────────────────────────┐
│              (foto em sangria total, véu superior)           │
│                                                              │
│      A ARARA QUE A SUA CLIENTE                               │
│      NÃO RESISTE.        ← cartaz gigante no terço superior  │
│                                                              │
│                                                              │
│  ┌────────────────┐                                          │
│  │ coluna estreita│                                          │
│  │ sub + 2 CTAs   │                                          │
│  └────────────────┘                                          │
│ ── 01 ── GRÁTIS ── BH+ONLINE ── 9 MARCAS ──  (folio faixa)   │
└──────────────────────────────────────────────────────────────┘
```

- **Contra:** mantém a foto em sangria total (bom), mas o resultado é o mesmo
  hero de sempre com o tipo maior. É polimento, não reenquadramento. Além
  disso, manchete no terço superior sobre foto ensolarada exige véu pesado no
  meio da imagem — mata justamente o "Sol" do conceito.

#### Direção C — "Prancha dupla sólida"

```
┌───────────────────────────┬──────────────────────────────────┐
│                           │                                  │
│   espresso sólido         │                                  │
│                           │            FOTO                  │
│   A ARARA                 │          full-height             │
│   QUE A SUA               │                                  │
│   CLIENTE                 │                                  │
│   NÃO RESISTE.            │                                  │
│                           │                                  │
│   [CTA] [CTA]             │                                  │
└───────────────────────────┴──────────────────────────────────┘
```

- **Contra:** 50/50 duro é simétrico demais (volta a ser previsível de outro
  jeito) e joga metade da capa fora. A fotografia é o ativo mais forte da
  marca; reduzi-la a meia tela é desperdício.

---

### 2.2 TENDÊNCIAS (vitrine de looks)

#### Direção A — "Prancha escalonada" ✅ ESCOLHIDA

Grade editorial de 12 colunas, com larguras e deslocamentos verticais
diferentes. O ladrilho vira **grade real de composição**, não só textura.

```
 PRANCHA 03            ┌─ 12 colunas ─────────────────────────┐
 ─────────             │                                      │
 │                     │
 │  ┌──────────────┐        ┌────────┐                        │
 │  │              │        │  02    │  ← sobe 64px           │
 │  │      01      │        │        │                        │
 │  │   (5 cols)   │        │(4 cols)│                        │
 │  │              │        └────────┘                        │
 │  │              │                    ┌────────┐            │
 │  └──────────────┘                    │  03    │ ← desce    │
 │                                      │(3 cols)│            │
 │        ┌────────┐    ┌──────────────┐└────────┘            │
 │        │  04    │    │      05      │                      │
 │        │(4 cols)│    │   (5 cols)   │   ┌────────┐         │
 │        └────────┘    │              │   │  06    │         │
 │                      └──────────────┘   │(3 cols)│         │
 │                                         └────────┘         │
 │  "A arara completa não cabe aqui →  Peça o catálogo"        │
```

- **Por quê:** é o gesto que mais distancia o site do template. Uma vitrine de
  moda impressa nunca alinha 6 fotos iguais numa grade.
- **Mobile:** vira coluna única com alternância de recuo (cards ímpares com
  recuo à direita, pares à esquerda) — mantém o ritmo editorial sem scroll
  lateral.
- **Sem JS:** a grade é CSS puro; só o reveal não roda.
- **Custo:** nenhum — mesma quantidade de imagens, `aspect-ratio` declarado em
  todos os cards, então **sem layout shift**.

#### Direção B — "A arara que passa" (scroll horizontal)

```
 PRANCHA 03
 ┌──────────────────────────────────────────────────────→ →
 │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
 │ │ 01 │ │ 02 │ │ 03 │ │ 04 │ │ 05 │ │ 06 │  scroll-snap
 │ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘
 │ ●───────○──────○      (indicador de posição)
```

- **A favor:** conceitualmente o mais forte — a *arara* é literalmente um
  trilho horizontal, e o gesto de deslizar é o gesto de passar peças na arara.
- **Contra:** esconde conteúdo. Em desktop, scroll horizontal dentro de página
  vertical é hostil (exige shift+scroll ou arrastar). Metade dos looks nunca
  seria vista. Como o objetivo único do site é levar ao WhatsApp e cada look é
  um CTA, **esconder look é perder conversão**. Fica registrado como
  **hipótese a testar** (ver §4).

#### Direção C — "Sticky com troca lateral"

```
 ┌─────────────────┬────────────────────────────────┐
 │ (sticky)        │  ┌──────────┐                  │
 │  03             │  │  foto 01 │                  │
 │  ──             │  └──────────┘                  │
 │  Alfaiataria    │  ┌──────────┐                  │
 │  leve           │  │  foto 02 │   rola           │
 │                 │  └──────────┘                  │
 │  [quero este]   │  ┌──────────┐                  │
 └─────────────────┴──└──────────┘──────────────────┘
```

- **Contra:** exige JS para sincronizar o texto com a foto em quadro; degrada
  mal sem JS; e no mobile o sticky lateral simplesmente não existe, virando
  uma lista comum. Muito custo para pouco ganho.

---

## 3. Diagnóstico priorizado (impacto ÷ esforço)

| # | Item | Problema | Mudança | Arquivos | Critério de aceite |
|---|---|---|---|---|---|
| 1 | **SEO local** | Sem sitemap, robots, JSON-LD ou canonical. "assessoria de moda BH" não tem como ranquear. | `sitemap.ts`, `robots.ts`, JSON-LD `ProfessionalService`, canonical, keywords | `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx`, `components/site/DadosEstruturados.tsx` | `/sitemap.xml` e `/robots.txt` respondem 200; JSON-LD valida sem erro; `/admin` fora do sitemap e com `disallow` |
| 2 | **Folio / autoria** | Todas as seções têm o mesmo cabeçalho centralizado. | Margem de prancha em todas as 8 seções | `globals.css`, `components/site/Folio.tsx`, todos os componentes de seção | Toda seção exibe número + fio + rótulo; no mobile vira linha horizontal |
| 3 | **Hero** | Layout de template: foto cheia + texto embaixo. Hierarquia fraca. | Direção A (dobra) | `sections.css`, `Hero.tsx` | Em ≥1080px existe coluna de tipo e sangria de foto distintas; LCP não piora |
| 4 | **Tendências** | Grade 3×2 regular; a vitrine não parece vitrine. | Direção A (escalonada) | `sections.css`, `Trends.tsx` | 6 looks visíveis sem scroll lateral; larguras/offsets distintos em ≥900px; sem CLS |
| 5 | **Movimento** | `fade-up` genérico em tudo. | Cortina, manchete linha a linha, contador de prancha, parallax curto | `animations.css`, `ScrollReveal.tsx`, `Folio.tsx` | Nenhum laço infinito novo; `prefers-reduced-motion` deixa tudo estático e legível |
| 6 | **Prova social** | Zero depoimentos, zero casos. É o maior buraco de conversão. | Seção de depoimentos que **não renderiza vazia** | `data/depoimentos.json` (vazio), `components/site/Testimonials.tsx` | Com o JSON vazio, nada aparece no DOM; com 1+ item, a seção aparece completa |
| 7 | **Conversão / jornada** | CTA do WhatsApp sem estado de hover que valha o toque; faixa de prova apagada. | Hover com deslocamento do ícone, faixa de prova com folio | `sections.css`, `WhatsAppButton.tsx` | Botão flutuante tem hover distinto e `:focus-visible` |
| 8 | **Performance / CWV** | `<img>` sem `width`/`height` → risco de CLS; sem `sizes`. | Dimensões declaradas, `decoding`, `aspect-ratio` | componentes de seção, `sections.css` | Build passa; nenhuma imagem sem proporção declarada |
| 9 | **Acessibilidade** | Menu mobile sem trava de foco; folio precisa ficar fora do leitor. | `aria-hidden` no decorativo, `:focus-visible` reforçado, `Esc` fecha o menu | `Folio.tsx`, `Header.tsx`, `globals.css` | Folio não é lido por leitor de tela; `Esc` fecha o menu; foco sempre visível |
| 10 | **Tipografia editorial** | Escala boa, mas sem refinamento de prancha. | Ligaduras, `text-wrap: balance` nos títulos, versalete nos rótulos, números tabulares | `globals.css` | Nenhuma quebra de linha órfã nos títulos em 1280px |

---

## 4. Separação: código × conteúdo × hipótese

### (a) Ajuste de código — feito nesta v2
Itens 1 a 10 da tabela acima. Nada depende de material novo.

### (b) Depende de conteúdo que só a Verônica pode fornecer

O site **não** ganhou nenhum dado inventado. Estes blocos estão construídos e
estilizados, mas ficam **invisíveis** até receberem conteúdo real:

1. **Depoimentos de lojistas** — `web/data/depoimentos.json`, hoje `[]`.
   Para cada um: nome da lojista, nome e cidade da loja, o texto e (opcional)
   `@` do Instagram da loja. Mínimo recomendado: 3.
2. **Endereço do atendimento presencial em BH** — hoje o JSON-LD declara só
   `areaServed: Belo Horizonte` porque não há endereço público confirmado. Com
   rua/bairro/CEP, vira `address` completo e passa a valer para busca local.
3. **Horário de atendimento** — para `openingHours` no JSON-LD.
4. **Foto de capa em 2 recortes** (retrato para mobile, paisagem para desktop).
   Hoje a mesma `capa.jpg` serve os dois; um recorte vertical melhoraria muito
   o enquadramento no celular.
5. **Fotos das araras montadas em loja de cliente** — hoje só existem fotos de
   look. Uma prancha "arara montada" seria a prova visual mais forte do serviço.

### (c) Hipóteses a testar (não implementadas)

1. **Vitrine em scroll horizontal** (Direção B de Tendências) — pode aumentar o
   tempo na seção, mas provavelmente reduz looks vistos. Testar contra a
   escalonada medindo cliques em card por sessão.
2. **CTA único no hero** — hoje são dois ("Agendar" / "Ver a coleção"). Um só
   pode subir a taxa de clique no WhatsApp, ou pode derrubar a exploração.
3. **Faixa de prova acima da dobra vs. abaixo** — hoje fica logo abaixo do
   hero.
4. **Etiqueta de preço/faixa de investimento** — reduziria lead desqualificado,
   mas exige decisão comercial da Verônica.

---

## 5. Regras de execução seguidas

- Um tema por etapa, commit-ável separadamente.
- `npm run lint && npm run typecheck && npm run build` a cada etapa.
- Nenhuma dependência nova. Nenhum hex hard-coded fora de `globals.css`.
- Nenhuma regra `.secao-x .btn { … }`: o sistema `.tom-*` continua sendo a
  única fonte de cor.
- Nada de CSP, consentimento, `/admin`, medição ou paleta foi tocado.

## 6. Critérios de "pronto"

1. `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` — verdes.
2. Contraste AA mantido nos dois contextos tonais.
3. `prefers-reduced-motion` deixa a página inteira estática e legível.
4. Sem layout shift: toda imagem tem proporção declarada.
5. Todo caminho de conversão termina no WhatsApp com mensagem contextual.
6. Nenhum dado de negócio inventado.
7. **Teste de autoria:** se este layout pudesse ser trocado pelo de qualquer
   outra consultora de moda sem ninguém notar, não está pronto. O folio de
   prancha, a dobra do hero e a vitrine escalonada existem para reprovar
   qualquer troca dessas.
