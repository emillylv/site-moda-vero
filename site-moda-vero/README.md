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

Você tem duas formas, pode usar qualquer uma a qualquer momento:

### Opção 1 — Painel visual (recomendado, sem mexer em código)
1. Abra `admin.html` no navegador (também acessível pelo link discreto no
   rodapé do site: "Editar coleção (painel interno)").
2. Coloque as fotos novas dentro da pasta `imgs/` antes de começar.
3. Edite o nome da coleção, os títulos, etiquetas e o caminho de cada foto
   (ex.: `imgs/0007.jpg`). Use as setas para reordenar e "Remover look" para
   excluir.
4. Acompanhe a prévia ao lado — é exatamente como vai aparecer no site.
5. Clique em **"Gerar arquivo"**, depois em **"Baixar trends-data.js"**.
6. Substitua o arquivo `trends-data.js` antigo (na pasta do site) pelo que
   acabou de baixar.

### Opção 2 — Editar `trends-data.js` diretamente
Abra o arquivo em qualquer editor de texto. Ele tem comentários explicando
cada campo. Basta copiar/colar um bloco `{ ... }` para duplicar um look, ou
apagar um bloco inteiro para remover.

## Publicando as alterações

Se o site estiver hospedado no GitHub Pages (como o protótipo original):
1. Suba os arquivos alterados (principalmente `trends-data.js` e, se houver,
   novas fotos em `imgs/`) para o repositório.
2. O GitHub Pages atualiza o site automaticamente em alguns minutos.

Se preferir, qualquer outro serviço de hospedagem de site estático (Netlify,
Vercel, hospedagem comum) também funciona — é só enviar os arquivos da pasta.

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
