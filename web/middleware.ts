import { NextRequest, NextResponse } from "next/server";

// Destinos de medição do Google (Analytics + Ads). O ping de conversão é
// enviado de forma redundante por vários desses hosts — inclusive o ccTLD do
// visitante —, então todos precisam valer para imagem e para fetch.
// Liberados apenas nas páginas públicas: o /admin segue com a política estrita.
const MEDICAO_GOOGLE = [
  "https://www.googletagmanager.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://www.googleadservices.com",
  "https://*.doubleclick.net",
  "https://pagead2.googlesyndication.com",
  "https://www.google.com",
  "https://www.google.com.br",
].join(" ");

function criarCsp(nonce: string, permitirMedicao: boolean): string {
  const desenvolvimento = process.env.NODE_ENV === "development";
  const medicao = permitirMedicao ? ` ${MEDICAO_GOOGLE}` : "";
  return [
    "default-src 'self'",
    `script-src 'self'${permitirMedicao ? " https://www.googletagmanager.com" : ""} 'nonce-${nonce}' 'strict-dynamic'${desenvolvimento ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    `style-src 'self' 'nonce-${nonce}'${desenvolvimento ? " 'unsafe-inline'" : ""}`,
    `img-src 'self' data: blob:${medicao}`,
    "font-src 'self' data:",
    `connect-src 'self'${medicao}${desenvolvimento ? " ws: wss:" : ""}`,
    "media-src 'none'",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
    "worker-src 'none'",
    ...(desenvolvimento ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const areaAdmin = request.nextUrl.pathname.startsWith("/admin");
  const csp = criarCsp(nonce, !areaAdmin);
  const headersRequisicao = new Headers(request.headers);
  headersRequisicao.set("x-nonce", nonce);
  headersRequisicao.set("Content-Security-Policy", csp);

  const resposta = NextResponse.next({ request: { headers: headersRequisicao } });
  resposta.headers.set("Content-Security-Policy", csp);

  if (areaAdmin) {
    resposta.headers.set("Cache-Control", "private, no-store, max-age=0");
    resposta.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  }
  return resposta;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.png|imgs/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
