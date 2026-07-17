/* =========================================================================
   SERVIDOR — serve o site estático e expõe /api/catalog/update
   Recebe o catálogo (colecao + itens) do painel admin.html, valida,
   e faz commit direto de trends-data.js no GitHub (sem disco/volume).
   ========================================================================= */

const express = require("express");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const path = require("path");

const PORT = process.env.PORT || 3000;
const CATALOG_TOKEN = process.env.CATALOG_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // formato: "usuario/repositorio"
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const GITHUB_FILE_PATH = process.env.GITHUB_FILE_PATH || "trends-data.js";
const TEMPO_LIMITE_GITHUB_MS = 10_000;
// Tamanho máximo (em bytes) de cada imagem já decodificada de base64.
const MAX_IMAGEM_BYTES = 5 * 1024 * 1024;

if (!CATALOG_TOKEN || !GITHUB_TOKEN || !GITHUB_REPO) {
  console.error(
    "Faltam variáveis de ambiente obrigatórias: CATALOG_TOKEN, GITHUB_TOKEN, GITHUB_REPO."
  );
  process.exit(1);
}
if (Buffer.byteLength(CATALOG_TOKEN, "utf8") < 32) {
  console.error("CATALOG_TOKEN deve ter pelo menos 32 bytes.");
  process.exit(1);
}
if (CATALOG_TOKEN !== CATALOG_TOKEN.trim() || /[\u0000-\u001f\u007f]/.test(CATALOG_TOKEN)) {
  console.error("CATALOG_TOKEN não pode conter espaços nas pontas nem caracteres de controle.");
  process.exit(1);
}
if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(GITHUB_REPO)) {
  console.error("GITHUB_REPO inválido. Use o formato usuario/repositorio.");
  process.exit(1);
}
if (
  !/^[A-Za-z0-9._/-]+$/.test(GITHUB_BRANCH) ||
  GITHUB_BRANCH.startsWith("/") ||
  GITHUB_BRANCH.endsWith("/") ||
  GITHUB_BRANCH.includes("..")
) {
  console.error("GITHUB_BRANCH inválida.");
  process.exit(1);
}
if (
  !/^[A-Za-z0-9._/-]+\.js$/.test(GITHUB_FILE_PATH) ||
  GITHUB_FILE_PATH.startsWith("/") ||
  GITHUB_FILE_PATH.includes("..")
) {
  console.error("GITHUB_FILE_PATH deve ser um caminho relativo seguro para um arquivo .js.");
  process.exit(1);
}

const app = express();
app.disable("x-powered-by");
if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
app.use((req, res, next) => {
  const cabecalhosSeguranca = {
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' https://fonts.googleapis.com",
      "font-src https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'none'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
    "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  };
  if (process.env.NODE_ENV === "production") {
    cabecalhosSeguranca["Strict-Transport-Security"] = "max-age=31536000";
  }
  res.set(cabecalhosSeguranca);
  next();
});
const lerJson = express.json({ limit: "512kb" });
// Limite maior só para imagens: base64 de 5 MB ≈ 6,8 MB + folga do JSON.
const lerJsonImagem = express.json({ limit: "8mb" });

// Limita tentativas de publicação para dificultar força bruta no token
const limiteAtualizacao = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) =>
    res.status(429).json({ status: "erro", mensagem: "Muitas tentativas. Tente novamente mais tarde." }),
});

/* ---------- Validação do payload ---------- */
const ETIQUETAS_VALIDAS = new Set([
  "Tendência",
  "Novo",
  "Mais pedido",
  "Edição limitada",
  "",
]);

function validarPayload(corpo) {
  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) return "Corpo inválido.";
  if (typeof corpo.colecao !== "string" || corpo.colecao.length > 200) {
    return "Campo 'colecao' inválido.";
  }
  if (!Array.isArray(corpo.itens) || corpo.itens.length > 200) {
    return "Campo 'itens' inválido (máximo de 200 looks).";
  }
  for (const item of corpo.itens) {
    if (!item || typeof item !== "object") return "Look inválido.";
    if (typeof item.imagem !== "string" || item.imagem.length === 0 || item.imagem.length > 300) {
      return "Campo 'imagem' inválido em algum look.";
    }
    if (!caminhoImagemValido(item.imagem)) {
      return "As imagens devem usar um caminho local seguro dentro de imgs/.";
    }
    if (item.imagemHover !== undefined && item.imagemHover !== null) {
      if (typeof item.imagemHover !== "string" || item.imagemHover.length > 300) {
        return "Campo 'imagemHover' inválido em algum look.";
      }
      if (item.imagemHover !== "" && !caminhoImagemValido(item.imagemHover)) {
        return "As imagens de hover devem usar um caminho local seguro dentro de imgs/.";
      }
    }
    if (item.titulo !== undefined && item.titulo !== null) {
      if (typeof item.titulo !== "string" || item.titulo.length > 200) {
        return "Campo 'titulo' inválido em algum look.";
      }
    }
    if (item.etiqueta !== undefined && item.etiqueta !== null) {
      if (typeof item.etiqueta !== "string" || !ETIQUETAS_VALIDAS.has(item.etiqueta)) {
        return "Campo 'etiqueta' inválido em algum look.";
      }
    }
  }
  return null;
}

function caminhoImagemValido(caminho) {
  return /^imgs\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:avif|gif|jpe?g|png|webp)$/i.test(caminho);
}

// Valida apenas o nome do arquivo (sem pasta). Sem "/", sem ".." e com
// extensão de imagem conhecida — vira "imgs/<nome>" no servidor.
function nomeImagemValido(nome) {
  return (
    typeof nome === "string" &&
    !nome.includes("..") &&
    /^[A-Za-z0-9][A-Za-z0-9._-]*\.(?:avif|gif|jpe?g|png|webp)$/i.test(nome)
  );
}

// Detecta o formato REAL pelos primeiros bytes (magic numbers), sem confiar
// na extensão nem no Content-Type informado pelo cliente. Retorna a extensão
// canônica ("jpeg", "png", "webp", "gif", "avif") ou null se não for imagem.
// SVG é deliberadamente rejeitado (pode carregar script) por não ter magic
// number binário e não constar nas extensões permitidas.
function detectarFormatoImagem(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) {
    return "png";
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";
  // GIF: "GIF87a" ou "GIF89a"
  if (
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) && buffer[5] === 0x61
  ) {
    return "gif";
  }
  // WEBP: "RIFF"....(tamanho)...."WEBP"
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return "webp";
  }
  // AVIF: caixa ISO-BMFF "ftyp" (offset 4) com marca "avif"/"avis"
  if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    const trecho = buffer.toString("latin1", 8, Math.min(buffer.length, 64));
    if (trecho.includes("avif") || trecho.includes("avis")) return "avif";
  }
  return null;
}

/* ---------- Geração do trends-data.js (mesma lógica do admin.js) ---------- */
function formatarString(texto) {
  return JSON.stringify(texto || "").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

function montarConteudoArquivo(corpo) {
  const nomeColecao = corpo.colecao || "Coleção atual";

  const blocoItens = corpo.itens
    .map((item) => {
      return `    {
      imagem: ${formatarString(item.imagem)},
      imagemHover: ${formatarString(item.imagemHover || item.imagem)},
      titulo: ${formatarString(item.titulo)},
      etiqueta: ${formatarString(item.etiqueta)}
    }`;
    })
    .join(",\n");

  return `/* ===================================================================
   COLEÇÃO ATUAL — arquivo fácil de editar
   Atualizado via painel (admin.html) em ${new Date().toLocaleString("pt-BR")}.
   Você também pode editar este arquivo manualmente: basta trocar o
   texto entre aspas " " de cada item.
   =================================================================== */

const colecaoTendencias = {
  colecao: ${formatarString(nomeColecao)},

  itens: [
${blocoItens}
  ]
};
`;
}

/* ---------- Integração com a API do GitHub ---------- */
function urlConteudoGitHub(caminhoArquivo) {
  const [dono, repositorio] = GITHUB_REPO.split("/");
  const caminho = caminhoArquivo.split("/").map(encodeURIComponent).join("/");
  return `https://api.github.com/repos/${encodeURIComponent(dono)}/${encodeURIComponent(repositorio)}/contents/${caminho}`;
}

function cabecalhosGitHub() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

// Retorna o SHA atual do arquivo, ou null se ele ainda não existe (404).
async function lerShaArquivoGitHub(caminhoArquivo) {
  const resposta = await fetch(`${urlConteudoGitHub(caminhoArquivo)}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, {
    headers: cabecalhosGitHub(),
    signal: AbortSignal.timeout(TEMPO_LIMITE_GITHUB_MS),
  });
  if (resposta.status === 404) return null;
  if (!resposta.ok) {
    throw new Error(`Não foi possível ler o arquivo atual no GitHub (${resposta.status}).`);
  }
  const atual = await resposta.json();
  if (!atual || typeof atual.sha !== "string") {
    throw new Error("Resposta inválida ao ler o arquivo atual no GitHub.");
  }
  return atual.sha;
}

async function commitArquivoGitHub({ caminhoArquivo, conteudoBase64, mensagem, sha }) {
  const corpo = { message: mensagem, content: conteudoBase64, branch: GITHUB_BRANCH };
  if (sha) corpo.sha = sha;
  const resposta = await fetch(urlConteudoGitHub(caminhoArquivo), {
    method: "PUT",
    headers: cabecalhosGitHub(),
    signal: AbortSignal.timeout(TEMPO_LIMITE_GITHUB_MS),
    body: JSON.stringify(corpo),
  });
  if (!resposta.ok) {
    throw new Error(`Falha ao publicar no GitHub (${resposta.status}).`);
  }
}

async function publicarNoGitHub(conteudo) {
  const sha = await lerShaArquivoGitHub(GITHUB_FILE_PATH);
  if (!sha) {
    throw new Error("Arquivo de catálogo não encontrado no GitHub.");
  }
  await commitArquivoGitHub({
    caminhoArquivo: GITHUB_FILE_PATH,
    conteudoBase64: Buffer.from(conteudo, "utf-8").toString("base64"),
    mensagem: "Atualiza catálogo de tendências via painel admin",
    sha,
  });
}

/* ---------- Autenticação por token (comparação em tempo constante) ---------- */
const HASH_TOKEN_ESPERADO = crypto.createHash("sha256").update(CATALOG_TOKEN, "utf8").digest();

function tokenValido(cabecalhoAuth) {
  if (!cabecalhoAuth || !cabecalhoAuth.startsWith("Bearer ")) return false;
  const recebido = cabecalhoAuth.slice("Bearer ".length);
  const hashRecebido = crypto.createHash("sha256").update(recebido, "utf8").digest();
  return crypto.timingSafeEqual(hashRecebido, HASH_TOKEN_ESPERADO);
}

function autenticarCatalogo(req, res, next) {
  res.set("Cache-Control", "no-store");
  if (!tokenValido(req.headers.authorization)) {
    return res.status(401).json({ status: "erro", mensagem: "Não autorizado." });
  }
  return next();
}

function exigirJson(req, res, next) {
  if (!req.is("application/json")) {
    return res.status(415).json({ status: "erro", mensagem: "Use Content-Type application/json." });
  }
  return next();
}

/* ---------- Rotas ---------- */
app.post("/api/catalog/update", limiteAtualizacao, autenticarCatalogo, exigirJson, lerJson, async (req, res) => {
  const erroValidacao = validarPayload(req.body);
  if (erroValidacao) {
    return res.status(400).json({ status: "erro", mensagem: erroValidacao });
  }

  try {
    const conteudo = montarConteudoArquivo(req.body);
    await publicarNoGitHub(conteudo);
    return res.json({ status: "ok" });
  } catch (erro) {
    console.error("Erro ao publicar catálogo:", erro.message);
    return res.status(502).json({ status: "erro", mensagem: "Falha ao publicar o catálogo." });
  }
});

app.post("/api/images/upload", limiteAtualizacao, autenticarCatalogo, exigirJson, lerJsonImagem, async (req, res) => {
  const corpo = req.body;
  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
    return res.status(400).json({ status: "erro", mensagem: "Corpo inválido." });
  }

  const { nome, conteudo, sobrescrever } = corpo;

  if (!nomeImagemValido(nome)) {
    return res.status(400).json({
      status: "erro",
      mensagem: "Nome inválido. Use apenas letras, números, ponto, hífen ou sublinhado, com extensão jpg, jpeg, png, webp, gif ou avif.",
    });
  }
  if (typeof conteudo !== "string" || conteudo.length === 0 || conteudo.length > 8_000_000) {
    return res.status(400).json({ status: "erro", mensagem: "Campo 'conteudo' (base64 da imagem) inválido." });
  }
  if (sobrescrever !== undefined && typeof sobrescrever !== "boolean") {
    return res.status(400).json({ status: "erro", mensagem: "Campo 'sobrescrever' deve ser true ou false." });
  }

  // Aceita um prefixo data:URL opcional e valida o base64 de forma estrita
  // (Buffer.from é tolerante e ignoraria lixo silenciosamente).
  const base64 = conteudo.replace(/^data:[a-z0-9.+-]+\/[a-z0-9.+-]+;base64,/i, "");
  if (base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
    return res.status(400).json({ status: "erro", mensagem: "Conteúdo não está em base64 válido." });
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0) {
    return res.status(400).json({ status: "erro", mensagem: "Imagem vazia." });
  }
  if (buffer.length > MAX_IMAGEM_BYTES) {
    return res.status(413).json({
      status: "erro",
      mensagem: `Imagem grande demais (máximo ${Math.floor(MAX_IMAGEM_BYTES / 1024 / 1024)} MB).`,
    });
  }

  const formato = detectarFormatoImagem(buffer);
  if (!formato) {
    return res.status(415).json({
      status: "erro",
      mensagem: "O conteúdo não é uma imagem válida (JPEG, PNG, WebP, GIF ou AVIF).",
    });
  }
  // A extensão declarada precisa bater com o formato real dos bytes.
  const extensao = nome.slice(nome.lastIndexOf(".") + 1).toLowerCase();
  const extensaoNormalizada = extensao === "jpg" ? "jpeg" : extensao;
  if (extensaoNormalizada !== formato) {
    return res.status(415).json({
      status: "erro",
      mensagem: "A extensão do arquivo não corresponde ao conteúdo real da imagem.",
    });
  }

  const caminhoArquivo = `imgs/${nome}`;
  if (!caminhoImagemValido(caminhoArquivo)) {
    return res.status(400).json({ status: "erro", mensagem: "Caminho de imagem inválido." });
  }

  try {
    const sha = await lerShaArquivoGitHub(caminhoArquivo);
    if (sha && sobrescrever !== true) {
      return res.status(409).json({
        status: "erro",
        mensagem: "Já existe uma imagem com esse nome. Envie \"sobrescrever\": true para substituir.",
      });
    }
    await commitArquivoGitHub({
      caminhoArquivo,
      conteudoBase64: buffer.toString("base64"),
      mensagem: `${sha ? "Atualiza" : "Adiciona"} imagem ${nome} via painel admin`,
      sha: sha || undefined,
    });
    return res.json({ status: "ok", caminho: caminhoArquivo });
  } catch (erro) {
    console.error("Erro ao publicar imagem:", erro.message);
    return res.status(502).json({ status: "erro", mensagem: "Falha ao publicar a imagem." });
  }
});

const ARQUIVOS_ESTATICOS = [
  "index.html",
  "admin.html",
  "styles.css",
  "admin.css",
  "script.js",
  "admin.js",
  "trends-data.js",
  "favicon.png",
];
for (const arquivo of ARQUIVOS_ESTATICOS) {
  app.get(`/${arquivo}`, (req, res) => {
    if (arquivo === "admin.html" || arquivo === "admin.js") {
      res.set("Cache-Control", "no-store");
    }
    res.sendFile(path.join(__dirname, arquivo));
  });
}
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.use("/imgs", express.static(path.join(__dirname, "imgs")));

app.use((erro, req, res, next) => {
  if (erro instanceof SyntaxError || erro.type === "entity.too.large") {
    const status = erro.type === "entity.too.large" ? 413 : 400;
    return res.status(status).json({ status: "erro", mensagem: "Corpo JSON inválido." });
  }
  console.error("Erro interno:", erro.message);
  return res.status(500).json({ status: "erro", mensagem: "Erro interno do servidor." });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = {
  app,
  caminhoImagemValido,
  detectarFormatoImagem,
  montarConteudoArquivo,
  nomeImagemValido,
  tokenValido,
  validarPayload,
};
