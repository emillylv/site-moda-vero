import type { MetadataRoute } from "next";
import { obterOrigemSite } from "@/lib/server/siteUrl";

/* Lido a cada requisição, e não congelado no build: a SITE_URL costuma ser
   injetada só no ambiente de execução, e um robots.txt pré-renderizado
   apontaria para o sitemap errado (ou para nenhum). */
export const dynamic = "force-dynamic";

/* O painel e a API ficam fora do índice: já respondem com X-Robots-Tag,
   o robots.txt só evita o rastreamento inútil. */
export default function robots(): MetadataRoute.Robots {
  const origem = obterOrigemSite();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/"],
    },
    ...(origem ? { sitemap: new URL("/sitemap.xml", origem).toString() } : {}),
  };
}
