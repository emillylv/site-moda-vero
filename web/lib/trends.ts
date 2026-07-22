import dadosColecao from "@/data/trends.json";
import type { Colecao } from "./catalog";

export { ETIQUETAS_VALIDAS } from "./catalog";
export type { Colecao, Etiqueta, LookColecao } from "./catalog";

/* O catálogo é JSON, não código executável. Ele é público por definição:
   contém somente os textos e caminhos de imagens exibidos no site. */

export const colecaoTendencias = dadosColecao as Colecao;
