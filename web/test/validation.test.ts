import assert from "node:assert/strict";
import test from "node:test";
import {
  caminhoImagemValido,
  detectarFormatoImagem,
  montarConteudoArquivo,
  validarPayload,
  type CatalogPayload,
} from "../lib/validation.ts";

const payload: CatalogPayload = {
  colecao: "Verão 2026",
  itens: [
    {
      imagem: "/imgs/0001.jpg",
      imagemHover: "/imgs/0001-alt.jpg",
      titulo: "Look",
      etiqueta: "Novo",
    },
  ],
};

test("catálogo rejeita caminhos externos, traversal e etiquetas arbitrárias", () => {
  assert.equal(validarPayload(payload), null);
  assert.equal(caminhoImagemValido("/imgs/look.webp"), true);
  assert.equal(caminhoImagemValido("https://exemplo.test/rastreio.png"), false);
  assert.match(
    validarPayload({ ...payload, itens: [{ ...payload.itens[0], imagem: "/imgs/../segredo.jpg" }] }) || "",
    /caminho local seguro/
  );
  assert.match(
    validarPayload({ ...payload, itens: [{ ...payload.itens[0], etiqueta: "<script>" }] }) || "",
    /etiqueta/
  );
  assert.match(validarPayload({ ...payload, itens: Array(201).fill(payload.itens[0]) }) || "", /200/);
});

test("serializador gera somente JSON e preserva texto sem executar conteúdo", () => {
  const malicioso = {
    ...payload,
    colecao: '</script><script>globalThis.injetado=true</script>"',
  };
  const serializado = montarConteudoArquivo(malicioso);
  const parsed = JSON.parse(serializado) as CatalogPayload;

  assert.equal(parsed.colecao, malicioso.colecao);
  assert.equal(serializado.includes("export const"), false);
});

test("detecção inicial rejeita SVG/HTML disfarçado de imagem", () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  assert.equal(detectarFormatoImagem(png), "png");
  assert.equal(detectarFormatoImagem(Buffer.from("<svg onload=alert(1)></svg>")), null);
  assert.equal(detectarFormatoImagem(Buffer.from("<!doctype html><script>")), null);
});
