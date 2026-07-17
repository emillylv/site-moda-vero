import { NextResponse } from "next/server";
import { validarPayload, montarConteudoArquivo, type CatalogPayload } from "@/lib/validation";
import { lerConfigGitHub, publicarCatalogoNoGitHub, tokenValido } from "@/lib/github";
import { verificarLimite, chaveCliente } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMITE_MAX = 10;
const LIMITE_JANELA_MS = 15 * 60 * 1000;

function erro(mensagem: string, status: number) {
  return NextResponse.json(
    { status: "erro", mensagem },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: Request) {
  // Rate limit por IP
  const limite = verificarLimite(
    `catalog:${chaveCliente(req)}`,
    LIMITE_MAX,
    LIMITE_JANELA_MS
  );
  if (!limite.permitido) {
    return erro("Muitas tentativas. Tente novamente mais tarde.", 429);
  }

  // Autenticação por token (tempo constante)
  if (!tokenValido(req.headers.get("authorization"))) {
    return erro("Não autorizado.", 401);
  }

  // Content-Type
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return erro("Use Content-Type application/json.", 415);
  }

  // Corpo
  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return erro("Corpo JSON inválido.", 400);
  }

  const erroValidacao = validarPayload(corpo);
  if (erroValidacao) {
    return erro(erroValidacao, 400);
  }

  // Configuração do GitHub
  const cfg = lerConfigGitHub();
  if ("erro" in cfg) {
    console.error("Config GitHub:", cfg.erro);
    return erro("Servidor não configurado para publicar.", 500);
  }

  try {
    const conteudo = montarConteudoArquivo(corpo as CatalogPayload);
    await publicarCatalogoNoGitHub(cfg, conteudo);
    return NextResponse.json(
      { status: "ok" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("Erro ao publicar catálogo:", (e as Error).message);
    return erro("Falha ao publicar o catálogo.", 502);
  }
}
