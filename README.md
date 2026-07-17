# Site — Verônica Chaves | Assessoria de Moda

Site institucional para captação e atendimento de lojistas, com seção de
tendências fácil de manter atualizada.

## Estrutura

```
index.html          → Página principal do site
admin.html           → Painel visual para editar a coleção de tendências
trends-data.js       → Arquivo com os looks da coleção atual (editável)
styles.css            → Estilo visual do site
admin.css             → Estilo visual do painel
script.js              → Comportamento do site (menu, animações, montagem da coleção)
admin.js               → Comportamento do painel
imgs/                  → Todas as fotos e logos
favicon.png            → Ícone da aba do navegador
```

## Como trocar a coleção atual ("Tendências")

Você tem três formas, pode usar qualquer uma a qualquer momento:

### Opção 1 — Publicar direto pelo painel (recomendado)
1. Abra `admin.html` no navegador (também acessível pelo link discreto no
   rodapé do site: "Editar coleção (painel interno)").
2. Coloque as fotos novas dentro da pasta `imgs/` antes de começar (isso
   ainda exige subir os arquivos de imagem manualmente — só o texto/JSON é
   publicado automaticamente).
3. Edite o nome da coleção, os títulos, etiquetas e o caminho de cada foto
   (ex.: `imgs/0007.jpg`). Use as setas para reordenar e "Remover look" para
   excluir.
4. Acompanhe a prévia ao lado — é exatamente como vai aparecer no site.
5. Digite a **chave de acesso** (fornecida por quem administra o site) e
   clique em **"Publicar direto no site"**. Em alguns minutos o site é
   atualizado sozinho — não precisa mexer em nenhum arquivo.

### Opção 2 — Painel visual + substituição manual
Mesmos passos acima, mas em vez de publicar direto, use "Gerar arquivo" →
"Baixar trends-data.js" (dentro de "Prefere gerar o arquivo manualmente?")
e suba o arquivo baixado para o repositório do site.

### Opção 3 — Editar `trends-data.js` diretamente
Abra o arquivo em qualquer editor de texto. Ele tem comentários explicando
cada campo. Basta copiar/colar um bloco `{ ... }` para duplicar um look, ou
apagar um bloco inteiro para remover. Depois suba o arquivo para o
repositório.

## Publicando as alterações (opções 2 e 3)

Suba os arquivos alterados (principalmente `trends-data.js` e, se houver,
novas fotos em `imgs/`) para o repositório. O deploy (GitHub Pages, Railway
ou qualquer hospedagem estática) atualiza o site automaticamente em alguns
minutos.

## Publicação automática (`/api/catalog/update`)

O servidor (`server.js`) serve os arquivos do site e expõe um endpoint que o
painel `admin.html` usa para publicar o catálogo sem precisar subir arquivo
nenhum manualmente. Ele **não grava nada em disco** (o Railway usa
filesystem efêmero) — em vez disso, faz commit do `trends-data.js`
atualizado direto no GitHub usando a API do GitHub, reaproveitando o deploy
automático que já existe.

### Configuração (variáveis de ambiente)
No Railway (Settings → Variables) ou em um `.env` local (veja
`.env.example`), defina:

- `CATALOG_TOKEN` — chave secreta que o cliente digita no painel para
  publicar. Gere uma forte e aleatória, ex.: `openssl rand -hex 32`.
- `GITHUB_TOKEN` — Personal Access Token do GitHub com permissão de
  escrita apenas em "Contents", restrito a este repositório
  (fine-grained token).
- `GITHUB_REPO` — no formato `usuario/repositorio`.
- `GITHUB_BRANCH` — branch onde o `trends-data.js` deve ser atualizado
  (padrão: `main`).
- `TRUST_PROXY=1` — use quando a aplicação estiver atrás de exatamente um
  proxy reverso confiável (como no Railway), para o limitador usar o IP real.

## Envio de imagens (`/api/images/upload`)

Além do catálogo, o servidor aceita **uma imagem por requisição**, também sem
gravar em disco: valida os bytes (por *magic number*, não pela extensão) e faz
commit do arquivo em `imgs/` no GitHub. Aceita JPEG, PNG, WebP, GIF e AVIF, com
limite de 5 MB por imagem.

Documentação completa — corpo da requisição, respostas, camadas de segurança e
exemplos em `curl`/JavaScript: **[`docs/api-imagens.md`](docs/api-imagens.md)**.

### Rodando localmente
```
npm install
CATALOG_TOKEN=... GITHUB_TOKEN=... GITHUB_REPO=usuario/repo npm start
```

### Segurança
- O token nunca fica salvo no código-fonte nem no navegador — o cliente
  digita na hora de publicar.
- O endpoint tem limite de tentativas (10 a cada 15 min) para dificultar
  força bruta na chave.
- O payload é validado (tamanho, tipos, quantidade de looks) antes de
  gerar o arquivo e publicar.
- Caminhos de imagem externos ou fora de `imgs/` são rejeitados.
- O servidor envia CSP e outros cabeçalhos contra XSS, clickjacking e
  interpretação incorreta de conteúdo; o painel também inclui CSP para
  hospedagens estáticas.
- A integração com o GitHub usa tempo limite para não prender conexões.
- Arquivos internos do servidor (`server.js`, `package.json`, `.env`) não
  são servidos publicamente — só os arquivos do site.

## Sobre as imagens

As fotos originais foram comprimidas e redimensionadas para o site carregar
rápido (de ~154 MB para ~2,5 MB no total) sem perda perceptível de
qualidade. Ao adicionar fotos novas, vale manter esse cuidado:
- Looks da coleção: formato vertical (retrato), ideal por volta de
  1000×1500 pixels.
- Evite enviar fotos diretamente da câmera/celular sem redimensionar —
  arquivos de 5 a 10 MB cada deixam o site lento.

## Personalização rápida

- **WhatsApp**: o número usado em todos os botões é `5531997433369`. Para
  trocar, use localizar e substituir nos arquivos `index.html` e
  `admin.html` (se necessário).
- **Instagram**: `@moda_bh_vero`, linkado no cabeçalho, hero e rodapé.
- **Cores**: estão centralizadas no topo do `styles.css`, na seção
  `:root`, com nomes em português (`--terracota`, `--camel`, etc.).
