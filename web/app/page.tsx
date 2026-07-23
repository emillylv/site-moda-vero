import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Trends } from "@/components/site/Trends";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Brands } from "@/components/site/Brands";
import { About } from "@/components/site/About";
import { Testimonials } from "@/components/site/Testimonials";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { ConsentAnalytics } from "@/components/site/ConsentAnalytics";
import { DadosEstruturados } from "@/components/site/DadosEstruturados";
import { colecaoTendencias } from "@/lib/trends";
import { depoimentos } from "@/lib/depoimentos";

/* Numeração das pranchas do lookbook. A de depoimentos só existe quando há
   depoimento real, então o fecho assume o número dela quando ela falta —
   nenhuma prancha pulada na margem. */
function numerarPranchas(temDepoimentos: boolean) {
  return {
    capa: "01",
    tendencias: "02",
    comoFunciona: "03",
    marcas: "04",
    sobre: "05",
    depoimentos: "06",
    contato: temDepoimentos ? "07" : "06",
  };
}

export default function Home() {
  const temDepoimentos = depoimentos.length > 0;
  const pranchas = numerarPranchas(temDepoimentos);

  return (
    <>
      <a className="skip-link" href="#conteudo-principal">
        Ir para o conteúdo
      </a>

      <Header />

      <main id="conteudo-principal">
        <Hero colecao={colecaoTendencias.colecao} />
        <Trends
          colecao={colecaoTendencias}
          numeroPrancha={pranchas.tendencias}
        />
        <HowItWorks numeroPrancha={pranchas.comoFunciona} />
        <Brands numeroPrancha={pranchas.marcas} />
        <About numeroPrancha={pranchas.sobre} />
        <Testimonials numeroPrancha={pranchas.depoimentos} />
        <Contact numeroPrancha={pranchas.contato} />
      </main>

      <Footer />
      <WhatsAppButton />
      <ConsentAnalytics />
      <ScrollReveal />
      <DadosEstruturados />
    </>
  );
}
