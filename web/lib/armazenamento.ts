/* =========================================================================
   Armazenamento persistente do painel (volume do Railway em produção).
   Usa node:fs — importe somente em código de servidor.

   <dir>/trends.json      catálogo publicado pelo painel
   <dir>/imgs/<uuid>.webp fotos enviadas pelo painel, servidas em /imgs/<uuid>.webp

   Toda escrita vai para um arquivo temporário e é renomeada no fim, então um
   visitante nunca lê um catálogo pela metade nem uma foto truncada.
   ========================================================================= */

import crypto from "node:crypto";
import { mkdir, readFile, rename, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { imagemGeradaPeloPainel, imagensDoCatalogo } from "./validation.ts";

const ARQUIVO_CATALOGO = "trends.json";
const PASTA_IMAGENS = "imgs";

function naoExiste(erro: unknown): boolean {
  return (erro as NodeJS.ErrnoException)?.code === "ENOENT";
}

/** Só nomes no formato que o próprio painel gera (<uuid>.webp) tocam o disco. */
function nomeImagemValido(nome: string): boolean {
  return imagemGeradaPeloPainel(`/imgs/${nome}`);
}

async function gravarAtomico(destino: string, conteudo: string | Buffer): Promise<void> {
  await mkdir(path.dirname(destino), { recursive: true });
  const temporario = `${destino}.${crypto.randomUUID()}.tmp`;
  try {
    await writeFile(temporario, conteudo);
    await rename(temporario, destino);
  } catch (erro) {
    await rm(temporario, { force: true });
    throw erro;
  }
}

/** Catálogo publicado no volume, ou null se o painel ainda não publicou nada. */
export async function lerCatalogoSalvo(dir: string): Promise<string | null> {
  try {
    return await readFile(path.join(dir, ARQUIVO_CATALOGO), "utf-8");
  } catch (erro) {
    if (naoExiste(erro)) return null;
    throw erro;
  }
}

export async function salvarImagem(dir: string, nome: string, conteudo: Buffer): Promise<void> {
  if (!nomeImagemValido(nome)) throw new Error("Nome de imagem inválido.");
  await gravarAtomico(path.join(dir, PASTA_IMAGENS, nome), conteudo);
}

/** Bytes da foto, ou null se o nome não é do painel ou o arquivo não existe. */
export async function lerImagemSalva(dir: string, nome: string): Promise<Buffer | null> {
  if (!nomeImagemValido(nome)) return null;
  try {
    return await readFile(path.join(dir, PASTA_IMAGENS, nome));
  } catch (erro) {
    if (naoExiste(erro)) return null;
    throw erro;
  }
}

function analisar(texto: string | null): unknown {
  if (texto === null) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

/**
 * Grava o catálogo e apaga do volume as fotos do painel que o catálogo
 * anterior usava e o novo não usa mais. Uma falha na faxina nunca derruba a
 * publicação: o catálogo já foi gravado, e uma foto órfã a mais é inofensiva.
 * Fotos que moram no repositório (public/imgs) não estão no volume e ficam.
 */
export async function publicarCatalogo(
  dir: string,
  conteudo: string
): Promise<{ removidas: string[] }> {
  const anterior = analisar(await lerCatalogoSalvo(dir).catch(() => null));
  await gravarAtomico(path.join(dir, ARQUIVO_CATALOGO), conteudo);

  const novo = analisar(conteudo);
  // Sem conseguir ler os dois lados não há diferença confiável: não apaga nada.
  if (!anterior || !novo) return { removidas: [] };

  const emUso = imagensDoCatalogo(novo);
  const removidas: string[] = [];
  for (const caminho of imagensDoCatalogo(anterior)) {
    if (emUso.has(caminho) || !imagemGeradaPeloPainel(caminho)) continue;
    try {
      await unlink(path.join(dir, PASTA_IMAGENS, caminho.slice("/imgs/".length)));
      removidas.push(caminho);
    } catch (erro) {
      if (!naoExiste(erro)) {
        console.error(
          "Não foi possível remover imagem órfã:",
          erro instanceof Error ? erro.message : "erro"
        );
      }
    }
  }
  return { removidas };
}
