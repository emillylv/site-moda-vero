import crypto from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { detectarFormatoImagem } from "@/lib/validation";
import { commitArquivoGitHub, lerConfigGitHub } from "@/lib/github";
import { obterSessaoAdmin } from "@/lib/server/adminAuth";
import { chaveCliente, verificarLimite } from "@/lib/server/rateLimit";
import { lerJsonLimitado, requisicaoAdminValida } from "@/lib/server/requestSecurity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGEM_BYTES = 5 * 1024 * 1024;
const MAX_CORPO_BYTES = 7_100_000;
const MAX_PIXELS = 24_000_000;

function resposta(mensagem: string, status: number) {
  return NextResponse.json(
    { status: "erro", mensagem },
    { status, headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } }
  );
}

export async function POST(req: Request) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return resposta("Não autorizado.", 401);
  if (!requisicaoAdminValida(req, sessao, req.headers.get("x-csrf-token"))) {
    return resposta("Requisição não permitida.", 403);
  }

  const limite = verificarLimite(`images:${sessao.auth}:${chaveCliente(req)}`, 30, 15 * 60 * 1000);
  if (!limite.permitido) return resposta("Muitas tentativas. Tente novamente mais tarde.", 429);

  const lido = await lerJsonLimitado<{ conteudo?: unknown }>(req, MAX_CORPO_BYTES);
  if (!lido.ok) return resposta(lido.mensagem, lido.status);
  const conteudo = lido.valor?.conteudo;
  if (typeof conteudo !== "string" || conteudo.length === 0 || conteudo.length > 7_000_000) {
    return resposta("Imagem inválida.", 400);
  }
  if (conteudo.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(conteudo)) {
    return resposta("Imagem inválida.", 400);
  }

  const original = Buffer.from(conteudo, "base64");
  if (original.length === 0 || original.length > MAX_IMAGEM_BYTES) {
    return resposta("Imagem grande demais (máximo de 5 MB).", 413);
  }
  if (!detectarFormatoImagem(original)) return resposta("Formato de imagem não aceito.", 415);

  let imagemPublica: Buffer;
  try {
    const pipeline = sharp(original, {
      animated: false,
      failOn: "warning",
      limitInputPixels: MAX_PIXELS,
    });
    const metadados = await pipeline.metadata();
    if (
      !metadados.width ||
      !metadados.height ||
      metadados.width * metadados.height > MAX_PIXELS ||
      metadados.width > 12_000 ||
      metadados.height > 12_000 ||
      (metadados.pages || 1) !== 1
    ) {
      return resposta("Dimensões da imagem não aceitas.", 415);
    }
    // Reencodar remove EXIF/GPS/XMP, descarta conteúdo adicional e limita as dimensões públicas.
    imagemPublica = await pipeline
      .rotate()
      .resize({ width: 1_600, height: 2_400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toBuffer();
  } catch {
    return resposta("Arquivo de imagem inválido.", 415);
  }

  const config = lerConfigGitHub();
  if ("erro" in config) {
    console.error("Configuração de publicação inválida.");
    return resposta("Publicação indisponível.", 503);
  }

  const nome = `${crypto.randomUUID()}.webp`;
  try {
    await commitArquivoGitHub(config, {
      caminhoArquivo: `${config.imagesDir}/${nome}`,
      conteudoBase64: imagemPublica.toString("base64"),
      mensagem: `Adiciona imagem ${nome} via painel admin`,
    });
    return NextResponse.json(
      { status: "ok", caminho: `/imgs/${nome}` },
      { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } }
    );
  } catch (erro) {
    console.error("Falha na publicação de imagem:", erro instanceof Error ? erro.message : "erro");
    return resposta("Falha ao publicar a imagem.", 502);
  }
}
