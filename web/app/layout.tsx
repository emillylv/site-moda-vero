import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";
import "./sections.css";
import "./animations.css";
import "../components/ds/ds.css";
import { obterBaseMetadata } from "@/lib/server/siteUrl";

// Fontes do design system Moda BH Vero — auto-hospedadas pelo next/font
// (sem requisição a CDN externo). Expostas como CSS custom properties.
//
// Bodoni Moda é uma didone: a letra de manchete das revistas de moda — a mesma
// que aparece no jornal que as modelos seguram na foto de capa. Jost é uma
// grotesca geométrica de linhagem Futura, a companheira clássica de uma didone.
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif-display",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: obterBaseMetadata(),
  title: "Assessoria de Moda em BH | Verônica Chaves — curadoria para lojistas",
  description:
    "Assessoria de moda para lojistas em Belo Horizonte. Curadoria peça por peça no atacado para montar a arara da temporada, atendimento presencial ou online e envio gratuito para todo o Brasil.",
  applicationName: "Verônica Chaves — Assessoria de Moda",
  authors: [{ name: "Verônica Chaves" }],
  creator: "Verônica Chaves",
  // Busca local: os termos que uma lojista de BH realmente digita.
  keywords: [
    "assessoria de moda BH",
    "assessoria de moda Belo Horizonte",
    "consultoria de moda para lojistas",
    "curadoria de moda no atacado",
    "moda atacado Belo Horizonte",
    "como montar arara de loja",
    "consultora de moda BH",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/favicon.png" },
  openGraph: {
    title: "Verônica Chaves | Assessoria de Moda para lojistas em BH",
    description:
      "Curadoria peça por peça no atacado para a arara da sua loja. Presencial em BH ou online, com envio gratuito para todo o Brasil.",
    images: [
      {
        url: "/imgs/capa.jpg",
        width: 1200,
        height: 630,
        alt: "Coleção de verão da curadoria Verônica Chaves",
      },
    ],
    locale: "pt_BR",
    siteName: "Verônica Chaves — Assessoria de Moda",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verônica Chaves | Assessoria de Moda para lojistas em BH",
    description:
      "Curadoria peça por peça no atacado para a arara da sua loja. Envio gratuito para todo o Brasil.",
    images: ["/imgs/capa.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#17110d",
  width: "device-width",
  initialScale: 1,
};

// A CSP usa um nonce novo por requisição; o Next precisa renderizar o HTML
// dinamicamente para aplicar esse nonce aos scripts do framework.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${bodoni.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}
