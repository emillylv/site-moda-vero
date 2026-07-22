import { NextResponse } from "next/server";
import { validarPayload, montarConteudoArquivo, type CatalogPayload } from "@/lib/validation";
import { lerConfigGitHub, publicarCatalogoNoGitHub } from "@/lib/github";
import { obterSessaoAdmin } from "@/lib/server/adminAuth";
import { chaveCliente, verificarLimite } from "@/lib/server/rateLimit";
import { lerJsonLimitado, requisicaoAdminValida } from "@/lib/server/requestSecurity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const limite = verificarLimite(
    `catalog:${sessao.auth}:${chaveCliente(req)}`,
    20,
    15 * 60 * 1000
  );
  if (!limite.permitido) return resposta("Muitas tentativas. Tente novamente mais tarde.", 429);

  const lido = await lerJsonLimitado(req, 256 * 1024);
  if (!lido.ok) return resposta(lido.mensagem, lido.status);
  const erroValidacao = validarPayload(lido.valor);
  if (erroValidacao) return resposta(erroValidacao, 400);

  const config = lerConfigGitHub();
  if ("erro" in config) {
    console.error("Configuração de publicação inválida.");
    return resposta("Publicação indisponível.", 503);
  }

  try {
    await publicarCatalogoNoGitHub(config, montarConteudoArquivo(lido.valor as CatalogPayload));
    return NextResponse.json(
      { status: "ok" },
      { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } }
    );
  } catch (erro) {
    console.error("Falha na publicação do catálogo:", erro instanceof Error ? erro.message : "erro");
    return resposta("Falha ao publicar o catálogo.", 502);
  }
}
