/* =========================================================================
   Validação compartilhada do catálogo (usada pela API e pelo painel admin).
   No projeto Next.js os caminhos de imagem
   seguem a convenção da pasta public: "/imgs/<arquivo>".
   ========================================================================= */

import { ETIQUETAS_VALIDAS } from "./catalog.ts";

const ETIQUETAS = new Set<string>(ETIQUETAS_VALIDAS);

// Caminho de imagem servido pela pasta public do Next: /imgs/<nome>.<ext>
const RE_CAMINHO_IMAGEM =
  /^\/imgs\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:avif|gif|jpe?g|png|webp)$/i;

export interface LookPayload {
  imagem: string;
  imagemHover?: string | null;
  titulo?: string | null;
  etiqueta?: string | null;
}

export interface CatalogPayload {
  colecao: string;
  itens: LookPayload[];
}

export function caminhoImagemValido(caminho: unknown): caminho is string {
  return typeof caminho === "string" && RE_CAMINHO_IMAGEM.test(caminho);
}

/** Retorna null se o payload for válido, ou uma mensagem de erro. */
export function validarPayload(corpo: unknown): string | null {
  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
    return "Corpo inválido.";
  }
  const body = corpo as Record<string, unknown>;

  if (typeof body.colecao !== "string" || body.colecao.length > 200) {
    return "Campo 'colecao' inválido.";
  }
  if (!Array.isArray(body.itens) || body.itens.length > 200) {
    return "Campo 'itens' inválido (máximo de 200 looks).";
  }

  for (const item of body.itens) {
    if (!item || typeof item !== "object") return "Look inválido.";
    const look = item as Record<string, unknown>;

    if (
      typeof look.imagem !== "string" ||
      look.imagem.length === 0 ||
      look.imagem.length > 300
    ) {
      return "Campo 'imagem' inválido em algum look.";
    }
    if (!caminhoImagemValido(look.imagem)) {
      return "As imagens devem usar um caminho local seguro dentro de /imgs.";
    }
    if (look.imagemHover !== undefined && look.imagemHover !== null) {
      if (typeof look.imagemHover !== "string" || look.imagemHover.length > 300) {
        return "Campo 'imagemHover' inválido em algum look.";
      }
      if (look.imagemHover !== "" && !caminhoImagemValido(look.imagemHover)) {
        return "As imagens de hover devem usar um caminho local seguro dentro de /imgs.";
      }
    }
    if (look.titulo !== undefined && look.titulo !== null) {
      if (typeof look.titulo !== "string" || look.titulo.length > 200) {
        return "Campo 'titulo' inválido em algum look.";
      }
    }
    if (look.etiqueta !== undefined && look.etiqueta !== null) {
      if (typeof look.etiqueta !== "string" || !ETIQUETAS.has(look.etiqueta)) {
        return "Campo 'etiqueta' inválido em algum look.";
      }
    }
  }
  return null;
}

/**
 * Detecta o formato REAL da imagem pelos primeiros bytes (magic numbers),
 * sem confiar na extensão nem no Content-Type. Retorna a extensão canônica
 * ou null. SVG é rejeitado (pode carregar script).
 */
export function detectarFormatoImagem(buffer: Buffer): string | null {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;

  // PNG
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e &&
    buffer[3] === 0x47 && buffer[4] === 0x0d && buffer[5] === 0x0a &&
    buffer[6] === 0x1a && buffer[7] === 0x0a
  ) {
    return "png";
  }
  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpeg";
  }
  // GIF
  if (
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 &&
    buffer[3] === 0x38 && (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return "gif";
  }
  // WEBP
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 &&
    buffer[3] === 0x46 && buffer[8] === 0x57 && buffer[9] === 0x45 &&
    buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return "webp";
  }
  // AVIF (ISO-BMFF "ftyp" + marca avif/avis)
  if (
    buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 &&
    buffer[7] === 0x70
  ) {
    const trecho = buffer.toString("latin1", 8, Math.min(buffer.length, 64));
    if (trecho.includes("avif") || trecho.includes("avis")) return "avif";
  }
  return null;
}

/**
 * Serializa apenas dados validados. O painel grava JSON em vez de gerar
 * TypeScript executável, reduzindo a superfície da cadeia de publicação.
 */
export function montarConteudoArquivo(corpo: CatalogPayload): string {
  const seguro = {
    colecao: corpo.colecao || "Coleção atual",
    itens: corpo.itens.map((item) => ({
      imagem: item.imagem,
      imagemHover: item.imagemHover || item.imagem,
      titulo: item.titulo || "",
      etiqueta: item.etiqueta || "",
    })),
  };
  return `${JSON.stringify(seguro, null, 2)}\n`;
}
