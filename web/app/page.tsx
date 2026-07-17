import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Trends } from "@/components/site/Trends";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Brands } from "@/components/site/Brands";
import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { colecaoTendencias } from "@/lib/trends";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#conteudo-principal">
        Ir para o conteúdo
      </a>

      <Header />

      <main id="conteudo-principal">
        <Hero />
        <Trends colecao={colecaoTendencias} />
        <HowItWorks />
        <Brands />
        <About />
        <Contact />
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollReveal />
    </>
  );
}
