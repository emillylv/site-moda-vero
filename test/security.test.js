"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { app } = require("../server");

async function comServidor(t) {
  const servidor = app.listen(0, "127.0.0.1");
  t.after(() => servidor.close());
  await new Promise((resolve) => servidor.once("listening", resolve));
  return `http://127.0.0.1:${servidor.address().port}`;
}

test("servidor legado expõe somente o site público com headers defensivos", async (t) => {
  const base = await comServidor(t);
  const resposta = await fetch(`${base}/`);

  assert.equal(resposta.status, 200);
  assert.equal(resposta.headers.get("x-powered-by"), null);
  assert.equal(resposta.headers.get("x-frame-options"), "DENY");
  assert.equal(resposta.headers.get("x-content-type-options"), "nosniff");
  assert.match(resposta.headers.get("content-security-policy"), /frame-ancestors 'none'/);
  assert.equal(resposta.headers.get("referrer-policy"), "no-referrer");
});

test("painel, APIs e arquivos internos legados não são publicados", async (t) => {
  const base = await comServidor(t);
  const alvos = [
    "/admin.html",
    "/admin.js",
    "/admin.css",
    "/api/catalog/update",
    "/api/images/upload",
    "/server.js",
    "/package.json",
    "/.env",
    "/web/.env.local",
  ];

  for (const alvo of alvos) {
    const resposta = await fetch(`${base}${alvo}`, { method: alvo.startsWith("/api/") ? "POST" : "GET" });
    assert.equal(resposta.status, 404, alvo);
  }
});

test("recursos públicos explícitos continuam disponíveis", async (t) => {
  const base = await comServidor(t);
  assert.equal((await fetch(`${base}/styles.css`)).status, 200);
  assert.equal((await fetch(`${base}/script.js`)).status, 200);
  assert.equal((await fetch(`${base}/imgs/0001.jpg`)).status, 200);
});
