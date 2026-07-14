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
async function publicarNoGitHub(conteudo) {
  const [dono, repositorio] = GITHUB_REPO.split("/");
  const caminhoArquivo = GITHUB_FILE_PATH.split("/").map(encodeURIComponent).join("/");
  const urlBase = `https://api.github.com/repos/${encodeURIComponent(dono)}/${encodeURIComponent(repositorio)}/contents/${caminhoArquivo}`;
  const cabecalhos = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };

  const respostaAtual = await fetch(`${urlBase}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, {
    headers: cabecalhos,
    signal: AbortSignal.timeout(TEMPO_LIMITE_GITHUB_MS),
  });
  if (!respostaAtual.ok) {
    throw new Error(`Não foi possível ler o arquivo atual no GitHub (${respostaAtual.status}).`);
  }
  const atual = await respostaAtual.json();
  if (!atual || typeof atual.sha !== "string") {
    throw new Error("Resposta inválida ao ler o arquivo atual no GitHub.");
  }

  const respostaCommit = await fetch(urlBase, {
    method: "PUT",
    headers: cabecalhos,
    signal: AbortSignal.timeout(TEMPO_LIMITE_GITHUB_MS),
    body: JSON.stringify({
      message: "Atualiza catálogo de tendências via painel admin",
      content: Buffer.from(conteudo, "utf-8").toString("base64"),
      sha: atual.sha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!respostaCommit.ok) {
    throw new Error(`Falha ao publicar no GitHub (${respostaCommit.status}).`);
  }
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

module.exports = { app, caminhoImagemValido, montarConteudoArquivo, tokenValido, validarPayload };
