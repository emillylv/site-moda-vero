import { NextResponse } from "next/server";
import { nomeCookieAdmin, obterSessaoAdmin, opcoesCookieAdmin } from "@/lib/server/adminAuth";
import { lerTextoLimitado, requisicaoAdminValida, urlConfiavel } from "@/lib/server/requestSecurity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) return new NextResponse(null, { status: 401 });

  const corpo = await lerTextoLimitado(req, 2 * 1024, "application/x-www-form-urlencoded");
  if (!corpo.ok) return new NextResponse(null, { status: corpo.status });
  const csrf = new URLSearchParams(corpo.valor).get("csrf");
  if (!requisicaoAdminValida(req, sessao, csrf)) return new NextResponse(null, { status: 403 });

  const resposta = NextResponse.redirect(urlConfiavel("/admin/login"), 303);
  resposta.headers.set("Cache-Control", "private, no-store");
  resposta.cookies.set(nomeCookieAdmin(), "", { ...opcoesCookieAdmin(), maxAge: 0 });
  return resposta;
}
