import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  lerCatalogoSalvo,
  lerImagemSalva,
  publicarCatalogo,
  salvarImagem,
} from "../lib/armazenamento.ts";

const NOME_A = "a2a8b391-e7b9-4a2b-ac23-65fa2f78f306.webp";
const NOME_B = "c82300e4-06f8-461b-b894-d67400f0354a.webp";

function catalogo(...imagens: string[]): string {
  return `${JSON.stringify({
    colecao: "Verão 2026",
    itens: imagens.map((imagem) => ({ imagem, imagemHover: imagem, titulo: "", etiqueta: "" })),
  })}\n`;
}

async function comPasta(corpo: (dir: string) => Promise<void>) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "moda-vero-"));
  try {
    await corpo(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("volume vazio não tem catálogo salvo nem imagem", async () => {
  await comPasta(async (dir) => {
    assert.equal(await lerCatalogoSalvo(dir), null);
    assert.equal(await lerImagemSalva(dir, NOME_A), null);
  });
});

test("imagem salva pode ser lida de volta, sem deixar arquivo temporário", async () => {
  await comPasta(async (dir) => {
    const bytes = Buffer.from("RIFF....WEBPdados");
    await salvarImagem(dir, NOME_A, bytes);

    assert.deepEqual(await lerImagemSalva(dir, NOME_A), bytes);
    assert.deepEqual(await readdir(path.join(dir, "imgs")), [NOME_A]);
  });
});

test("só nomes gerados pelo painel são gravados ou servidos", async () => {
  await comPasta(async (dir) => {
    await writeFile(path.join(dir, "segredo.webp"), "x");

    for (const nome of ["../segredo.webp", "capa.jpg", NOME_A.replace(".webp", ".png"), ""]) {
      await assert.rejects(salvarImagem(dir, nome, Buffer.from("x")), /inválido/);
      assert.equal(await lerImagemSalva(dir, nome), null);
    }
  });
});

test("publicar grava o catálogo e apaga só as fotos do painel que saíram dele", async () => {
  await comPasta(async (dir) => {
    await salvarImagem(dir, NOME_A, Buffer.from("a"));
    await salvarImagem(dir, NOME_B, Buffer.from("b"));

    // Primeira publicação: não há catálogo anterior no volume, nada é apagado.
    const primeira = catalogo(`/imgs/${NOME_A}`, `/imgs/${NOME_B}`, "/imgs/0001.jpg");
    assert.deepEqual(await publicarCatalogo(dir, primeira), { removidas: [] });
    assert.equal(await lerCatalogoSalvo(dir), primeira);

    // NOME_B e 0001.jpg saem; 0001.jpg é do repositório e nunca é apagada.
    const segunda = catalogo(`/imgs/${NOME_A}`);
    assert.deepEqual(await publicarCatalogo(dir, segunda), { removidas: [`/imgs/${NOME_B}`] });
    assert.equal(await lerCatalogoSalvo(dir), segunda);
    assert.deepEqual(await readdir(path.join(dir, "imgs")), [NOME_A]);
    assert.deepEqual(await readdir(dir).then((itens) => itens.sort()), ["imgs", "trends.json"]);
  });
});

test("foto do painel que mora no repositório (fora do volume) não conta como removida", async () => {
  await comPasta(async (dir) => {
    await publicarCatalogo(dir, catalogo(`/imgs/${NOME_A}`));
    assert.deepEqual(await publicarCatalogo(dir, catalogo("/imgs/0001.jpg")), { removidas: [] });
  });
});

test("catálogo anterior corrompido não impede a publicação nem apaga nada", async () => {
  await comPasta(async (dir) => {
    await salvarImagem(dir, NOME_A, Buffer.from("a"));
    await writeFile(path.join(dir, "trends.json"), "{ quebrado");

    const novo = catalogo("/imgs/0001.jpg");
    assert.deepEqual(await publicarCatalogo(dir, novo), { removidas: [] });
    assert.equal(await readFile(path.join(dir, "trends.json"), "utf-8"), novo);
    assert.deepEqual(await readdir(path.join(dir, "imgs")), [NOME_A]);
  });
});
