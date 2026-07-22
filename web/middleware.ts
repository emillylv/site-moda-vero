import { NextRequest, NextResponse } from "next/server";

function criarCsp(nonce: string): string {
  const desenvolvimento = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' https://www.googletagmanager.com 'nonce-${nonce}' 'strict-dynamic'${desenvolvimento ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    `style-src 'self' 'nonce-${nonce}'${desenvolvimento ? " 'unsafe-inline'" : ""}`,
    "img-src 'self' data: blob: https://*.google-analytics.com",
    "font-src 'self' data:",
    `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com${desenvolvimento ? " ws: wss:" : ""}`,
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
  const csp = criarCsp(nonce);
  const headersRequisicao = new Headers(request.headers);
  headersRequisicao.set("x-nonce", nonce);
  headersRequisicao.set("Content-Security-Policy", csp);

  const resposta = NextResponse.next({ request: { headers: headersRequisicao } });
  resposta.headers.set("Content-Security-Policy", csp);

  if (request.nextUrl.pathname.startsWith("/admin")) {
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
