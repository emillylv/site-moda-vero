import type { MetadataRoute } from "next";
import { obterBaseMetadata } from "@/lib/server/siteUrl";

/* Mesma razão do robots.ts: a origem canônica vem do ambiente de execução. */
export const dynamic = "force-dynamic";

/* Site de página única: só a home entra. O /admin é privado e nunca é listado. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = obterBaseMetadata();

  return [
    {
      url: base.toString(),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
