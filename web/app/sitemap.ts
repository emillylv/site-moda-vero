import type { MetadataRoute } from "next";
import { obterBaseMetadata } from "@/lib/server/siteUrl";

/* Mesma razão do robots.ts: a origem canônica vem do ambiente de execução. */
export const dynamic = "force-dynamic";

/* A home e a página de agendamento. O /admin é privado e nunca é listado. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = obterBaseMetadata();
  const agora = new Date();

  return [
    {
      url: base.toString(),
      lastModified: agora,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: new URL("/agendamento", base).toString(),
      lastModified: agora,
      changeFrequency: "yearly",
      priority: 0.8,
    },
  ];
}
