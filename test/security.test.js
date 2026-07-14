"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const vm = require("node:vm");

process.env.CATALOG_TOKEN = "a".repeat(32);
process.env.GITHUB_TOKEN = "github-token-de-teste";
process.env.GITHUB_REPO = "usuario/repositorio";

const {
  app,
  caminhoImagemValido,
  montarConteudoArquivo,
  tokenValido,
  validarPayload,
} = require("../server");

const payloadValido = {
  colecao: "Verão 2026",
  itens: [{ imagem: "imgs/0001.jpg", imagemHover: "imgs/0001-alt.jpg", titulo: "Look", etiqueta: "Novo" }],
};

test("valida autenticação e caminhos sem aceitar travessia ou URLs externas", () => {
  assert.equal(tokenValido(`Bearer ${"a".repeat(32)}`), true);
  assert.equal(tokenValido(`Bearer ${"a".repeat(31)}b`), false);
  assert.equal(caminhoImagemValido("imgs/look-01.webp"), true);
  assert.equal(caminhoImagemValido("imgs/../server.js"), false);
  assert.equal(caminhoImagemValido("https://exemplo.test/rastreio.png"), false);
  assert.equal(validarPayload(payloadValido), null);
  assert.match(
    validarPayload({ ...payloadValido, itens: [{ ...payloadValido.itens[0], imagem: "../segredo.jpg" }] }),
    /caminho local seguro/
  );
});

test("gera JavaScript válido mesmo com caracteres usados em injeção", () => {
  const conteudo = montarConteudoArquivo({
    colecao: 'Ataque"; globalThis.injetado = true; //\r\n\u2028',
    itens: payloadValido.itens,
  });
  const contexto = {};
  new vm.Script(`${conteudo}\nglobalThis.nome = colecaoTendencias.colecao;`).runInNewContext(contexto);
  assert.equal(contexto.injetado, undefined);
  assert.equal(contexto.nome, 'Ataque"; globalThis.injetado = true; //\r\n\u2028');
});

test("endpoint aplica cabeçalhos de segurança e rejeita acesso sem token antes do JSON", async (t) => {
  const servidor = app.listen(0);
  t.after(() => servidor.close());
  await new Promise((resolve) => servidor.once("listening", resolve));
  const base = `http://127.0.0.1:${servidor.address().port}`;

  const pagina = await fetch(`${base}/`);
  assert.match(pagina.headers.get("content-security-policy"), /frame-ancestors 'none'/);
  assert.equal(pagina.headers.get("x-frame-options"), "DENY");
  assert.equal(pagina.headers.get("x-content-type-options"), "nosniff");

  const resposta = await fetch(`${base}/api/catalog/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{".repeat(600_000),
  });
  assert.equal(resposta.status, 401);
  assert.equal(resposta.headers.get("cache-control"), "no-store");

  const tipoIncorreto = await fetch(`${base}/api/catalog/update`, {
    method: "POST",
    headers: { Authorization: `Bearer ${"a".repeat(32)}`, "Content-Type": "text/plain" },
    body: "{}",
  });
  assert.equal(tipoIncorreto.status, 415);

  const jsonInvalido = await fetch(`${base}/api/catalog/update`, {
    method: "POST",
    headers: { Authorization: `Bearer ${"a".repeat(32)}`, "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(jsonInvalido.status, 400);
});
