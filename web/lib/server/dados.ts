import "server-only";

import path from "node:path";
import catalogoDoRepositorio from "@/data/trends.json";
import { lerCatalogoSalvo } from "@/lib/armazenamento";
import type { Colecao } from "@/lib/catalog";
import { validarPayload } from "@/lib/validation";

/**
 * Pasta persistente onde o painel grava catálogo e fotos. No Railway basta
 * anexar um volume ao serviço: ele define RAILWAY_VOLUME_MOUNT_PATH sozinho.
 * Em produção sem volume retorna null, e o painel recusa gravar em vez de
 * escrever no disco efêmero do container (que some no próximo deploy).
 */
export function diretorioDados(): string | null {
  const configurado = process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH;
  if (configurado) return path.resolve(configurado);
  if (process.env.NODE_ENV !== "production") return path.join(process.cwd(), ".dados");
  return null;
}

/**
 * Catálogo atual: o último publicado pelo painel, ou o data/trends.json do
 * repositório enquanto o volume ainda não tem nenhum.
 */
export async function lerColecao(): Promise<Colecao> {
  const dir = diretorioDados();
  if (dir) {
    try {
      const texto = await lerCatalogoSalvo(dir);
      if (texto !== null) {
        const salvo: unknown = JSON.parse(texto);
        if (validarPayload(salvo) === null) return salvo as Colecao;
        console.error("Catálogo salvo no volume é inválido; usando o do repositório.");
      }
    } catch (erro) {
      console.error(
        "Não foi possível ler o catálogo do volume:",
        erro instanceof Error ? erro.message : "erro"
      );
    }
  }
  return catalogoDoRepositorio as Colecao;
}
