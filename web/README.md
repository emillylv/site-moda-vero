# Verônica Chaves — Next.js

Aplicação principal do site: Next.js 15.5.21 Maintenance LTS, App Router,
React 19 e TypeScript estrito. Site público, painel e backend administrativo
executam no mesmo framework.

## Rodar localmente

```bash
npm ci
cp .env.example .env.local
npm run admin:hash-password
npm run dev
```

Gere `ADMIN_SESSION_SECRET` separadamente (`openssl rand -base64 48`) e
preencha todas as variáveis descritas em `.env.example`.

## Estrutura relevante

```text
app/admin/login/                 login server-side
app/admin/page.tsx               painel protegido
app/api/admin/session/           criação/remoção da sessão
app/api/admin/catalog/           publicação do catálogo
app/api/admin/images/            processamento/publicação de imagens
components/admin/                editor React dividido por responsabilidade
data/trends.json                 catálogo público, sem código executável
lib/server/                      sessão, CSRF, limites e código server-only
lib/security/                    primitivas testáveis de senha e sessão
public/imgs/                     mídia pública
middleware.ts                    CSP estrita com nonce por requisição
```

O painel atualiza `data/trends.json` e imagens via GitHub Contents API. Use um
token fine-grained restrito ao repositório e à permissão `Contents: read/write`.
O token nunca é enviado ao navegador. A foto só é transmitida após uma segunda
confirmação no painel; depois disso ela é gravada imediatamente no repositório,
antes da publicação do catálogo. Prefira repositório privado ou branch de
staging caso a mídia não possa ficar acessível antes de entrar na coleção.

## Segurança

- senha armazenada como hash scrypt (`N=2^15`, `r=8`, `p=3`);
- sessão assinada de 8 horas em cookie `HttpOnly`, `Secure`,
  `SameSite=Strict`, invalidada ao rotacionar senha ou segredo;
- autorização repetida na Server Component e em cada Route Handler;
- CSRF vinculado à sessão, `Origin`, host e Fetch Metadata validados;
- leitura streaming com teto antes do parse JSON;
- rate limit com IP somente quando o proxy é explicitamente confiável,
  expiração e cardinalidade limitada (use WAF/Redis compartilhado ao escalar);
- imagens limitadas a 5 MiB/24 MP, decodificadas e reencodadas para WebP sem
  EXIF, GPS ou XMP, com nomes aleatórios;
- CSP com nonce, HSTS em produção e respostas administrativas `no-store`;
- nenhum segredo usa prefixo `NEXT_PUBLIC_`.

## Verificações

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm audit
```

Configure o deploy preferencialmente com Node 24.18+ LTS (ou 22.23.1+ na linha
22); instalações em runtimes mais antigos são recusadas por `engine-strict`.
Use `SITE_URL` com a origem HTTPS exata. Se a versão antiga do Next chegou a
ficar online, reimplante primeiro e depois rotacione todos os segredos e o
token do GitHub.
