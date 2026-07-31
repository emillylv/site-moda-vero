import assert from "node:assert/strict";
import test from "node:test";
import {
  imagemGeradaPeloPainel,
  imagensDoCatalogo,
} from "../lib/validation.ts";

const UUID_A = "/imgs/a2a8b391-e7b9-4a2b-ac23-65fa2f78f306.webp";
const UUID_B = "/imgs/c82300e4-06f8-461b-b894-d67400f0354a.webp";

test("só arquivos nomeados pelo painel podem ser apagados", () => {
  assert.equal(imagemGeradaPeloPainel(UUID_A), true);
  assert.equal(imagemGeradaPeloPainel(UUID_B), true);

  // Os assets fixos do site jamais entram na faxina, mesmo sem uso no catálogo.
  for (const fixo of [
    "/imgs/capa.jpg",
    "/imgs/capa-video.jpg",
    "/imgs/veronica.jpg",
    "/imgs/insta.png",
    "/imgs/ws.png",
    "/imgs/0001.jpg",
    "/imgs/0001-alt.jpg",
    "/imgs/look-novo-2026.jpg",
  ]) {
    assert.equal(imagemGeradaPeloPainel(fixo), false, `${fixo} não pode ser apagável`);
  }

  // Nem um UUID em pasta/extensão diferente, nem travessia de caminho.
  assert.equal(imagemGeradaPeloPainel(`${UUID_A.replace(".webp", ".jpg")}`), false);
  assert.equal(
    imagemGeradaPeloPainel("/outra/a2a8b391-e7b9-4a2b-ac23-65fa2f78f306.webp"),
    false
  );
  assert.equal(
    imagemGeradaPeloPainel("/imgs/../a2a8b391-e7b9-4a2b-ac23-65fa2f78f306.webp"),
    false
  );
  assert.equal(imagemGeradaPeloPainel(null), false);
  assert.equal(imagemGeradaPeloPainel(undefined), false);
});

test("imagensDoCatalogo junta a foto principal e a de hover", () => {
  const catalogo = {
    colecao: "Verão 2026",
    itens: [
      { imagem: UUID_A, imagemHover: UUID_B, titulo: "Um", etiqueta: "Novo" },
      { imagem: "/imgs/capa.jpg", imagemHover: "", titulo: "Dois", etiqueta: "" },
    ],
  };
  assert.deepEqual(
    [...imagensDoCatalogo(catalogo)].sort(),
    [UUID_A, UUID_B, "/imgs/capa.jpg"].sort()
  );
});

test("imagensDoCatalogo ignora entradas malformadas sem estourar", () => {
  assert.deepEqual([...imagensDoCatalogo(null)], []);
  assert.deepEqual([...imagensDoCatalogo({})], []);
  assert.deepEqual([...imagensDoCatalogo({ itens: "nada" })], []);
  assert.deepEqual([...imagensDoCatalogo({ itens: [null, 7, {}] })], []);
  // Caminho fora de /imgs não é colecionado nem para uso nem para exclusão.
  assert.deepEqual(
    [...imagensDoCatalogo({ itens: [{ imagem: "https://exemplo.com/x.jpg" }] })],
    []
  );
});

test("a diferença entre dois catálogos só oferece órfãs do painel", () => {
  const antes = {
    itens: [
      { imagem: UUID_A, imagemHover: UUID_B },
      { imagem: "/imgs/veronica.jpg" },
    ],
  };
  const depois = { itens: [{ imagem: UUID_A }] };

  const emUso = imagensDoCatalogo(depois);
  const orfas = [...imagensDoCatalogo(antes)].filter(
    (caminho) => !emUso.has(caminho) && imagemGeradaPeloPainel(caminho)
  );

  // Só a hover trocada sai; veronica.jpg fica mesmo tendo saído do catálogo.
  assert.deepEqual(orfas, [UUID_B]);
});

test("uma imagem ainda usada por outro look nunca vira órfã", () => {
  const antes = { itens: [{ imagem: UUID_A, imagemHover: UUID_B }] };
  // O mesmo arquivo migra de hover de um look para principal de outro.
  const depois = { itens: [{ imagem: UUID_A }, { imagem: UUID_B }] };

  const emUso = imagensDoCatalogo(depois);
  const orfas = [...imagensDoCatalogo(antes)].filter(
    (caminho) => !emUso.has(caminho) && imagemGeradaPeloPainel(caminho)
  );
  assert.deepEqual(orfas, []);
});
