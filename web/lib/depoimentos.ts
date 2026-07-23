import dados from "@/data/depoimentos.json";

/**
 * Prova social — depoimentos reais de lojistas.
 *
 * O arquivo `data/depoimentos.json` nasce VAZIO de propósito: o site não
 * inventa cliente, loja nem frase. Enquanto a lista estiver vazia a seção
 * inteira não é renderizada (ver `Testimonials.tsx`).
 *
 * Para publicar, basta preencher o JSON com objetos neste formato:
 *
 *   [
 *     {
 *       "texto": "A arara vendeu inteira em duas semanas.",
 *       "nome": "Nome da lojista",
 *       "loja": "Nome da loja",
 *       "cidade": "Belo Horizonte, MG"
 *     }
 *   ]
 *
 * `texto` e `nome` são obrigatórios; `loja` e `cidade` são opcionais.
 */
export type Depoimento = {
  texto: string;
  nome: string;
  loja?: string;
  cidade?: string;
};

function valido(item: Depoimento): boolean {
  return Boolean(item?.texto?.trim() && item?.nome?.trim());
}

/* Entradas pela metade são descartadas: melhor não mostrar do que mostrar
   um depoimento sem assinatura, que lê como inventado. */
export const depoimentos: Depoimento[] = (dados as Depoimento[]).filter(valido);
