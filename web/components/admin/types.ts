export interface LookEdicao {
  id: number;
  imagem: string;
  imagemHover: string;
  titulo: string;
  etiqueta: string;
}

export type CampoLookEdicao = Exclude<keyof LookEdicao, "id">;

export interface StatusAdmin {
  texto: string;
  tipo: "ok" | "erro" | "";
}
