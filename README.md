# Site — Verônica Chaves | Assessoria de Moda

A aplicação de produção está em [`web/`](web/): Next.js App Router, TypeScript,
site institucional, painel autenticado e APIs administrativas no mesmo runtime.

## Desenvolvimento

```bash
cd web
npm ci
cp .env.example .env.local
npm run dev
```

Antes de preencher `.env.local`, gere o hash da senha sem colocar a senha em
texto puro no ambiente:

```bash
npm run admin:hash-password
openssl rand -base64 48
```

Use o primeiro resultado em `ADMIN_PASSWORD_HASH` e o segundo em
`ADMIN_SESSION_SECRET`. Consulte [`web/.env.example`](web/.env.example) para as
demais variáveis. Em produção, `SITE_URL` precisa ser a origem HTTPS exata.

## Administração

O painel fica em `/admin` dentro do Next.js. Não existe mais painel estático,
token Bearer no JavaScript do navegador ou API administrativa no servidor
Express legado.

- a senha é verificada no servidor por scrypt;
- a sessão curta fica em cookie `HttpOnly`, `Secure` e `SameSite=Strict`;
- página e APIs validam a sessão no servidor;
- mutações exigem CSRF e origem exata;
- o catálogo é persistido como JSON, não como código executável;
- imagens são limitadas, decodificadas, reencodadas em WebP e publicadas sem
  EXIF/GPS/XMP;
- o token fine-grained do GitHub permanece exclusivamente no servidor.

Configure o deploy com o diretório raiz `web/` e use `npm run build` / `npm
start`, preferencialmente em Node 24.18+ LTS. Depois de migrar um ambiente que
executou versões antigas, rotacione os segredos administrativos e o token do
GitHub.

## Validação

```bash
cd web
npm test
npm run lint
npm run typecheck
npm run build
npm audit
```

Os arquivos HTML/CSS/JS na raiz são uma versão pública estática mantida apenas
para transição. `server.js` serve somente essa página pública e não recebe
credenciais nem oferece rotas de escrita.
