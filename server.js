"use strict";

// Servidor compatível apenas com a página pública estática legada.
// O painel e todas as mutações vivem exclusivamente na aplicação Next em web/.
const express = require("express");
const path = require("node:path");

const app = express();
const portaRecebida = Number(process.env.PORT || 3000);
const PORT = Number.isSafeInteger(portaRecebida) && portaRecebida > 0 && portaRecebida <= 65535
  ? portaRecebida
  : 3000;

app.disable("x-powered-by");

app.use((req, res, next) => {
  const csp = [
    "default-src 'self'",
    "script-src 'self' https://www.googletagmanager.com",
    "script-src-attr 'none'",
    "style-src 'self'",
    "font-src 'self'",
    "img-src 'self' data: blob: https://*.google-analytics.com",
    "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
    "media-src 'none'",
    "object-src 'none'",
    "frame-src 'none'",
    "worker-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  res.set({
    "Content-Security-Policy": csp,
    "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=(), browsing-topics=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-Permitted-Cross-Domain-Policies": "none",
  });
  if (process.env.NODE_ENV === "production") {
    res.set("Strict-Transport-Security", "max-age=31536000");
  }
  next();
});

const ARQUIVOS_PUBLICOS = [
  "index.html",
  "styles.css",
  "script.js",
  "analytics.js",
  "trends-data.js",
  "favicon.png",
];

for (const arquivo of ARQUIVOS_PUBLICOS) {
  app.get(`/${arquivo}`, (req, res, next) => {
    res.set("Cache-Control", arquivo.endsWith(".html") ? "no-cache" : "public, max-age=3600");
    res.sendFile(path.join(__dirname, arquivo), (erro) => (erro ? next() : undefined));
  });
}

app.get("/", (req, res) => {
  res.set("Cache-Control", "no-cache");
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use(
  "/imgs",
  express.static(path.join(__dirname, "imgs"), {
    dotfiles: "deny",
    fallthrough: false,
    immutable: true,
    maxAge: "1d",
    redirect: false,
  })
);

app.use((req, res) => {
  res.status(404).type("text/plain").send("Não encontrado.");
});

app.use((erro, req, res, next) => {
  if (res.headersSent) return next(erro);
  if (erro && erro.status === 404) {
    return res.status(404).type("text/plain").send("Não encontrado.");
  }
  console.error("Falha ao servir recurso público.");
  return res.status(500).type("text/plain").send("Erro interno.");
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Servidor público rodando na porta ${PORT}`));
}

module.exports = { app };
