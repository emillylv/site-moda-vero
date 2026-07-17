import { NextResponse } from "next/server";
import { nomeImagemValido, detectarFormatoImagem } from "@/lib/validation";
import {
  lerConfigGitHub,
  lerShaArquivoGitHub,
  commitArquivoGitHub,
  tokenValido,
} from "@/lib/github";
import { verificarLimite, chaveCliente } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMITE_MAX = 10;
const LIMITE_JANELA_MS = 15 * 60 * 1000;
const MAX_IMAGEM_BYTES = 5 * 1024 * 1024;

function erro(mensagem: string, status: number) {
  return NextResponse.json(
    { status: "erro", mensagem },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: Request) {
  const limite = verificarLimite(
    `images:${chaveCliente(req)}`,
    LIMITE_MAX,
    LIMITE_JANELA_MS
  );
  if (!limite.permitido) {
    return erro("Muitas tentativas. Tente novamente mais tarde.", 429);
  }

  if (!tokenValido(req.headers.get("authorization"))) {
    return erro("Não autorizado.", 401);
  }

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return erro("Use Content-Type application/json.", 415);
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return erro("Corpo JSON inválido.", 400);
  }

  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
    return erro("Corpo inválido.", 400);
  }
  const { nome, conteudo, sobrescrever } = corpo as {
    nome?: unknown;
    conteudo?: unknown;
    sobrescrever?: unknown;
  };

  if (!nomeImagemValido(nome)) {
    return erro(
      "Nome inválido. Use letras, números, ponto, hífen ou sublinhado, com extensão jpg, jpeg, png, webp, gif ou avif.",
      400
    );
  }
  if (typeof conteudo !== "string" || conteudo.length === 0 || conteudo.length > 8_000_000) {
    return erro("Campo 'conteudo' (base64 da imagem) inválido.", 400);
  }
  if (sobrescrever !== undefined && typeof sobrescrever !== "boolean") {
    return erro("Campo 'sobrescrever' deve ser true ou false.", 400);
  }

  // Aceita prefixo data:URL opcional e valida o base64 de forma estrita.
  const base64 = conteudo.replace(/^data:[a-z0-9.+-]+\/[a-z0-9.+-]+;base64,/i, "");
  if (base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
    return erro("Conteúdo não está em base64 válido.", 400);
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0) {
    return erro("Imagem vazia.", 400);
  }
  if (buffer.length > MAX_IMAGEM_BYTES) {
    return erro(
      `Imagem grande demais (máximo ${Math.floor(MAX_IMAGEM_BYTES / 1024 / 1024)} MB).`,
      413
    );
  }

  const formato = detectarFormatoImagem(buffer);
  if (!formato) {
    return erro("O conteúdo não é uma imagem válida (JPEG, PNG, WebP, GIF ou AVIF).", 415);
  }

  // A extensão declarada precisa bater com o formato real dos bytes.
  const extensao = nome.slice(nome.lastIndexOf(".") + 1).toLowerCase();
  const extensaoNormalizada = extensao === "jpg" ? "jpeg" : extensao;
  if (extensaoNormalizada !== formato) {
    return erro("A extensão do arquivo não corresponde ao conteúdo real da imagem.", 415);
  }

  const cfg = lerConfigGitHub();
  if ("erro" in cfg) {
    console.error("Config GitHub:", cfg.erro);
    return erro("Servidor não configurado para publicar.", 500);
  }

  const caminhoArquivo = `${cfg.imagesDir}/${nome}`;

  try {
    const sha = await lerShaArquivoGitHub(cfg, caminhoArquivo);
    if (sha && sobrescrever !== true) {
      return erro(
        'Já existe uma imagem com esse nome. Envie "sobrescrever": true para substituir.',
        409
      );
    }
    await commitArquivoGitHub(cfg, {
      caminhoArquivo,
      conteudoBase64: buffer.toString("base64"),
      mensagem: `${sha ? "Atualiza" : "Adiciona"} imagem ${nome} via painel admin`,
      sha: sha || undefined,
    });
    return NextResponse.json(
      { status: "ok", caminho: `/imgs/${nome}` },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("Erro ao publicar imagem:", (e as Error).message);
    return erro("Falha ao publicar a imagem.", 502);
  }
}
