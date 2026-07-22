import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import "./sections.css";
import "./animations.css";
import "../components/ds/ds.css";
import { obterBaseMetadata } from "@/lib/server/siteUrl";

// Fontes do design system Moda BH Vero — auto-hospedadas pelo next/font
// (sem requisição a CDN externo). Expostas como CSS custom properties.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: obterBaseMetadata(),
  title: "Verônica Chaves | Assessoria de Moda em Belo Horizonte",
  description:
    "Assessoria de moda para lojistas em Belo Horizonte. Curadoria exclusiva de peças no atacado, consultoria personalizada e envio para todo o Brasil.",
  icons: { icon: "/favicon.png" },
  openGraph: {
    title: "Verônica Chaves | Assessoria de Moda",
    description:
      "Moda para lojistas: curadoria exclusiva no atacado, com consultoria personalizada e envio para todo o Brasil.",
    images: ["/imgs/capa.jpg"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#171514",
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
    <html lang="pt-BR" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
