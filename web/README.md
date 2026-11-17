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
app/api/admin/images/            processamento/gravação de imagens
app/imgs/[arquivo]/              serve as fotos gravadas no volume
components/admin/                editor React dividido por responsabilidade
data/trends.json                 catálogo inicial (usado até a 1ª publicação)
lib/armazenamento.ts             leitura/gravação de catálogo e fotos no volume
lib/server/                      sessão, CSRF, limites e código server-only
lib/security/                    primitivas testáveis de senha e sessão
public/imgs/                     mídia fixa do site (versionada)
middleware.ts                    CSP estrita com nonce por requisição
```

## Onde o painel grava

O painel grava o catálogo e as fotos num **volume persistente** (no Railway,
um Volume anexado ao serviço; o caminho vem de `RAILWAY_VOLUME_MOUNT_PATH`,
ou de `DATA_DIR` em outros ambientes):

```text
<volume>/trends.json        catálogo publicado — o site lê daqui a cada acesso
<volume>/imgs/<uuid>.webp   fotos enviadas — servidas em /imgs/<uuid>.webp
```

Publicar não gera commit nem redeploy: o site muda na hora. Enquanto o volume
não tiver `trends.json`, o site exibe `data/trends.json` do repositório; depois
da primeira publicação, **editar `data/trends.json` no git não muda mais o
site** — use o painel. As fotos de `public/imgs` continuam servidas normalmente
e nunca são apagadas pelo painel.

Em produção sem volume o painel recusa gravar (503) em vez de escrever no disco
efêmero do container. O volume não entra no git: faça backup pelo Railway
(aba *Backups* do volume) e, para o catálogo, pelo botão “Baixar trends.json”.

## Segurança

- senha armazenada como hash scrypt (`N=2^15`, `r=8`, `p=3`);
- sessão assinada de 8 horas em cookie `HttpOnly`, `Secure`,
  `SameSite=Strict`, invalidada ao rotacionar senha ou segredo;
- autorização repetida na Server Component e em cada Route Handler;
- CSRF vinculado à sessão, `Origin`, host e Fetch Metadata validados;
- leitura streaming com teto antes do parse JSON;
- rate limit com IP somente quando o proxy é explicitamente confiável,
  expiração e cardinalidade limitada (use WAF/Redis compartilhado ao escalar);
- imagens limitadas a 20 MiB/50 MP, decodificadas e reencodadas para WebP sem
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
ficar online, reimplante primeiro e depois rotacione todos os segredos.
