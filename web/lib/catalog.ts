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
