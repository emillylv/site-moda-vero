import { NextResponse } from "next/server";
import {
  autenticarSenhaAdmin,
  nomeCookieAdmin,
  novaSessaoAdmin,
  opcoesCookieAdmin,
} from "@/lib/server/adminAuth";
import { chaveCliente, verificarLimite } from "@/lib/server/rateLimit";
import { lerTextoLimitado, origemMutacaoValida, urlConfiavel } from "@/lib/server/requestSecurity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirecionar(caminho: string) {
  const resposta = NextResponse.redirect(urlConfiavel(caminho), 303);
  resposta.headers.set("Cache-Control", "private, no-store");
  return resposta;
}

export async function POST(req: Request) {
  if (!origemMutacaoValida(req)) {
    return new NextResponse(null, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const cliente = chaveCliente(req);
  const porCliente = verificarLimite(`login:${cliente}`, 5, 15 * 60 * 1000);
  if (!porCliente.permitido) return redirecionar("/admin/login?erro=1");

  const global = verificarLimite("login:global", 100, 15 * 60 * 1000);
  if (!global.permitido) return redirecionar("/admin/login?erro=1");

  const corpo = await lerTextoLimitado(req, 2 * 1024, "application/x-www-form-urlencoded");
  if (!corpo.ok) return redirecionar("/admin/login?erro=1");

  const campos = new URLSearchParams(corpo.valor);
  const senhas = campos.getAll("password");
  if (senhas.length !== 1 || !(await autenticarSenhaAdmin(senhas[0]))) {
    return redirecionar("/admin/login?erro=1");
  }

  const nova = novaSessaoAdmin();
  if (!nova) return redirecionar("/admin/login?erro=1");

  const resposta = redirecionar("/admin");
  resposta.cookies.set(nomeCookieAdmin(), nova.token, opcoesCookieAdmin());
  return resposta;
}
