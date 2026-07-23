import { headers } from "next/headers";
import { obterBaseMetadata } from "@/lib/server/siteUrl";
import { LINKS, WHATSAPP_TELEFONE_E164 } from "@/lib/links";

/**
 * JSON-LD para busca local ("assessoria de moda BH").
 *
 * Só declara o que é verificável no próprio site: nome, descrição, telefone
 * público do WhatsApp, cidade de atuação e Instagram. Sem endereço de rua,
 * horário, faixa de preço ou avaliação — nada disso foi fornecido, e inventar
 * dado estruturado é o caminho mais rápido para uma penalização.
 *
 * O bloco leva o nonce da requisição para respeitar a CSP estrita.
 */
export async function DadosEstruturados() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const base = obterBaseMetadata();

  const dados = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": new URL("/#assessoria", base).toString(),
    name: "Verônica Chaves — Assessoria de Moda",
    alternateName: "Moda BH Vero",
    description:
      "Assessoria de moda para lojistas em Belo Horizonte: curadoria de peças no atacado para montar a arara da temporada, atendimento presencial ou online e envio gratuito para todo o Brasil.",
    url: base.toString(),
    image: new URL("/imgs/capa.jpg", base).toString(),
    telephone: WHATSAPP_TELEFONE_E164,
    serviceType: "Assessoria e curadoria de moda para lojistas",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Belo Horizonte",
      addressRegion: "MG",
      addressCountry: "BR",
    },
    areaServed: [
      { "@type": "City", name: "Belo Horizonte" },
      { "@type": "Country", name: "Brasil" },
    ],
    founder: {
      "@type": "Person",
      name: "Verônica Chaves",
      jobTitle: "Consultora de moda",
    },
    knowsAbout: [
      "Assessoria de moda",
      "Curadoria de moda no atacado",
      "Consultoria para lojistas",
      "Tendências de moda feminina",
    ],
    sameAs: [LINKS.instagram],
  };

  // `<` escapado: nenhum dado aqui é externo, mas um bloco JSON-LD nunca deve
  // conseguir fechar a própria tag.
  const json = JSON.stringify(dados).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
