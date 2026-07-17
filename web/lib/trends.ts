/* =========================================================================
   COLEÇÃO ATUAL — dados tipados (migrado de trends-data.js)
   Editável à mão ou pelo painel /admin. Cada look tem foto principal,
   foto de hover (opcional), título e etiqueta.
   ========================================================================= */

export const ETIQUETAS_VALIDAS = [
  "Tendência",
  "Novo",
  "Mais pedido",
  "Edição limitada",
  "",
] as const;

export type Etiqueta = (typeof ETIQUETAS_VALIDAS)[number];

export interface LookColecao {
  imagem: string;
  imagemHover?: string;
  titulo?: string;
  etiqueta?: Etiqueta;
}

export interface Colecao {
  colecao: string;
  itens: LookColecao[];
}

export const colecaoTendencias: Colecao = {
  colecao: "Verão 2026",
  itens: [
    {
      imagem: "/imgs/0001.jpg",
      imagemHover: "/imgs/0001-alt.jpg",
      titulo: "Alfaiataria leve",
      etiqueta: "Tendência",
    },
    {
      imagem: "/imgs/0002.jpg",
      imagemHover: "/imgs/0002-alt.jpg",
      titulo: "Texturas naturais",
      etiqueta: "Tendência",
    },
    {
      imagem: "/imgs/0003.jpg",
      imagemHover: "/imgs/0003-alt.jpg",
      titulo: "Tons terrosos",
      etiqueta: "Novo",
    },
    {
      imagem: "/imgs/0004.jpg",
      imagemHover: "/imgs/0004-alt.jpg",
      titulo: "Camadas e sobreposições",
      etiqueta: "Tendência",
    },
    {
      imagem: "/imgs/0006.jpg",
      imagemHover: "/imgs/0006-alt.jpg",
      titulo: "Acessórios statement",
      etiqueta: "Novo",
    },
    {
      imagem: "/imgs/0005.jpg",
      imagemHover: "/imgs/0005-alt.jpg",
      titulo: "Elegância casual",
      etiqueta: "Mais pedido",
    },
  ],
};
