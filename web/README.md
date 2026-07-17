# Verônica Chaves — Site (Next.js + Moda BH Vero Design System)

Reescrita do site institucional da **Verônica Chaves — Assessoria de Moda** em
**Next.js (App Router + TypeScript)**, aplicando o design system **Moda BH Vero**
(tokens de cor/tipografia/espaçamento/sombra e os primitivos Button, Card, Badge,
Input e Heading).

## Stack

- **Next.js 15** (App Router, React 19, Server Components)
- **TypeScript** (strict)
- Fontes **Cormorant Garamond** + **Manrope** via `next/font` (auto-hospedadas, sem CDN)
- Estilos com **CSS custom properties** (tokens do design system) — sem dependência de UI externa

## Estrutura

```
web/
├── app/
│   ├── layout.tsx            # fontes, metadados, tokens globais
│   ├── globals.css           # tokens do DS + base
│   ├── sections.css          # estilos das seções do site
│   ├── page.tsx              # home (monta as seções)
│   ├── admin/page.tsx        # painel interno (noindex)
│   └── api/
│       ├── catalog/update/   # POST — publica a coleção (commit no GitHub)
│       └── images/upload/    # POST — publica uma imagem (commit no GitHub)
├── components/
│   ├── ds/                   # primitivos do design system (Button, Card, Badge, Input, Heading)
│   ├── site/                 # seções (Header, Hero, Trends, HowItWorks, Brands, About, Contact, Footer, WhatsAppButton)
│   └── admin/                # editor visual da coleção
├── lib/
│   ├── trends.ts             # dados da coleção (tipados) — editável à mão ou pelo painel
│   ├── validation.ts         # validação compartilhada + gerador de trends.ts
│   ├── github.ts             # integração com a Contents API do GitHub + auth por token
│   ├── rateLimit.ts          # rate limiter em memória
│   └── links.ts              # WhatsApp / Instagram
└── public/imgs/              # imagens da marca e dos looks
```

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm run start    # serve o build
npm run lint
```

## Como editar a coleção

Duas formas, ambas alterando `lib/trends.ts`:

1. **À mão** — edite `lib/trends.ts` (mesma forma da coleção original).
2. **Painel visual** — acesse `/admin`, monte os looks e clique em
   **“Publicar direto no site”** informando a `CATALOG_TOKEN`. O painel faz
   `POST /api/catalog/update`; a API valida, gera o novo `lib/trends.ts` e o
   **commita no GitHub**, disparando um novo deploy.

## Variáveis de ambiente

Veja `.env.example`. Para o painel/API funcionarem em produção são necessárias
`CATALOG_TOKEN`, `GITHUB_TOKEN` e `GITHUB_REPO` (as demais têm padrão). O site
público funciona sem nenhuma delas.

## Segurança (portado do servidor Express original)

- Autenticação por token com comparação em **tempo constante** (`crypto.timingSafeEqual`).
- **Rate limiting** nas rotas de publicação (10 tentativas / 15 min por IP).
- Upload de imagem valida o **formato real** pelos magic numbers (SVG rejeitado)
  e exige que a extensão bata com o conteúdo.
- Cabeçalhos de segurança (CSP, X-Frame-Options, etc.) em `next.config.mjs`.
- `/admin` marcado como `noindex, nofollow`.

## Design System

Os tokens em `app/globals.css` e os primitivos em `components/ds/` seguem o
design system **Moda BH Vero** (claude.ai/design). Paleta: tinta `#1C1814`,
papel `#F8F2E7`, terracota `#AD5430`, camel `#C7A06A`. Tipografia editorial
(Cormorant Garamond) + interface (Manrope).
