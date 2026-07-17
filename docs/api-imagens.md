# API de imagens — `POST /api/images/upload`

Endpoint para enviar **uma imagem por requisição**. O servidor valida os bytes
e faz *commit* do arquivo em `imgs/` diretamente no GitHub, reaproveitando o
deploy automático. Nada é gravado em disco (o filesystem do Railway é efêmero).

> Complementa o endpoint de catálogo `POST /api/catalog/update`, que atualiza o
> `trends-data.js`. Os dois compartilham autenticação, limite de tentativas e
> cabeçalhos de segurança.

---

## Requisição

| | |
|---|---|
| **Método** | `POST` |
| **Caminho** | `/api/images/upload` |
| **Autenticação** | `Authorization: Bearer <CATALOG_TOKEN>` |
| **Content-Type** | `application/json` |
| **Limite do corpo** | 8 MB |

### Corpo (JSON)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `nome` | string | sim | Nome do arquivo, ex.: `0007.jpg`. Sem pasta, sem `/`, sem `..`. Extensão: `jpg`, `jpeg`, `png`, `webp`, `gif` ou `avif`. |
| `conteudo` | string | sim | Imagem em **base64**. Aceita o prefixo opcional `data:image/...;base64,`. |
| `sobrescrever` | boolean | não | `true` para substituir uma imagem já existente. Padrão: `false`. |

Exemplo mínimo:

```json
{
  "nome": "0007.jpg",
  "conteudo": "/9j/4AAQSkZJRgABAQAAAQ..."
}
```

O servidor sempre grava em `imgs/<nome>` — o cliente **não** informa a pasta.

---

## Respostas

| Status | Corpo | Quando |
|---|---|---|
| `200` | `{ "status": "ok", "caminho": "imgs/0007.jpg" }` | Sucesso. Use `caminho` no catálogo. |
| `400` | `{ "status": "erro", "mensagem": "..." }` | Nome inválido, base64 inválido ou corpo malformado. |
| `401` | `{ "status": "erro", "mensagem": "Não autorizado." }` | Token ausente ou incorreto. |
| `409` | `{ "status": "erro", "mensagem": "Já existe uma imagem..." }` | Nome já existe e `sobrescrever` não é `true`. |
| `413` | `{ "status": "erro", "mensagem": "Imagem grande demais..." }` | Imagem acima de 5 MB (ou corpo acima de 8 MB). |
| `415` | `{ "status": "erro", "mensagem": "..." }` | Content-Type errado, não é imagem válida, ou extensão não bate com o conteúdo. |
| `429` | `{ "status": "erro", "mensagem": "Muitas tentativas..." }` | Excesso de tentativas malsucedidas (limite de força bruta). |
| `502` | `{ "status": "erro", "mensagem": "Falha ao publicar a imagem." }` | Erro ao falar com o GitHub. |

---

## Camadas de segurança

O endpoint foi desenhado para não confiar em nada que o cliente diz.

1. **Formato real por *magic bytes*.** O servidor ignora a extensão e o
   `Content-Type` e inspeciona os primeiros bytes do arquivo. Só aceita se for
   de fato JPEG, PNG, WebP, GIF ou AVIF (`detectarFormatoImagem`).
2. **SVG rejeitado de propósito.** SVG é XML e pode conter `<script>`/`onload`;
   fica fora das extensões permitidas e não tem assinatura binária.
3. **Extensão precisa bater com o conteúdo.** Um `.jpg` que na verdade é PNG —
   ou um HTML/JS disfarçado — é recusado com `415`.
4. **Sem travessia de caminho.** O nome não pode conter `/` nem `..`; o arquivo
   sempre vai para `imgs/`. Há dupla verificação (`nomeImagemValido` e
   `caminhoImagemValido`).
5. **Tamanho limitado.** 5 MB por imagem após decodificar; corpo JSON limitado
   a 8 MB (limite maior aplicado **apenas** a esta rota).
6. **Base64 estrito.** O conteúdo é validado com regex antes de decodificar
   (`Buffer.from` é tolerante e engoliria caracteres inválidos em silêncio).
7. **Não sobrescreve por acidente.** Se o nome já existe, retorna `409`; só
   substitui com `"sobrescrever": true` explícito.
8. **Autenticação em tempo constante.** O token é comparado com
   `crypto.timingSafeEqual` (via hash SHA-256), evitando ataques de tempo.
9. **Limite de tentativas.** 10 tentativas malsucedidas a cada 15 min. Uploads
   bem-sucedidos **não** contam (`skipSuccessfulRequests`), então o envio em
   lote de imagens legítimas não é bloqueado.
10. **Sem escrita em disco.** O conteúdo vai direto para a API do GitHub em
    base64, com *timeout* de 10 s por chamada.

> **Nota:** o servidor **não** redimensiona nem recomprime a imagem — guarda os
> bytes recebidos. Otimize as fotos antes de enviar (ideal ~1000×1500 px) para
> não inchar o repositório.

---

## Exemplos

### curl

```bash
curl -X POST https://SEU-APP.up.railway.app/api/images/upload \
  -H "Authorization: Bearer $CATALOG_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"0007.jpg\",\"conteudo\":\"$(base64 -w0 0007.jpg)\"}"
```

### JavaScript no navegador (a partir de um `<input type="file">`)

```javascript
async function enviarImagem(arquivo, token) {
  // Converte o arquivo escolhido para base64
  const base64 = await new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result.split(",")[1]); // remove o prefixo data:
    leitor.onerror = reject;
    leitor.readAsDataURL(arquivo);
  });

  const resposta = await fetch("/api/images/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nome: arquivo.name,     // ex.: "0007.jpg"
      conteudo: base64,
      // sobrescrever: true,  // só para substituir uma imagem existente
    }),
  });

  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.mensagem);
  return dados.caminho;       // ex.: "imgs/0007.jpg" — use no catálogo
}
```

### Várias imagens

Faça um envio por arquivo (cada um vira um commit). Como uploads
bem-sucedidos não contam no limite de tentativas, o envio em lote funciona:

```javascript
for (const arquivo of listaDeArquivos) {
  await enviarImagem(arquivo, token);
}
```

---

## Fluxo recomendado para trocar a coleção

1. Envie as fotos novas com `POST /api/images/upload` e anote cada `caminho`
   retornado (`imgs/...`).
2. Monte o catálogo apontando para esses caminhos e publique com
   `POST /api/catalog/update` (ou pelo painel `admin.html`).
3. O GitHub dispara o deploy automático e o site atualiza em alguns minutos.
