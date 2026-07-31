import type { Metadata } from "next";
import Link from "next/link";
import { AgendamentoForm } from "@/components/site/AgendamentoForm";
import { ConsentAnalytics } from "@/components/site/ConsentAnalytics";
import { Folio } from "@/components/site/Folio";
import { Footer } from "@/components/site/Footer";
import { ScrollReveal } from "@/components/site/ScrollReveal";

export const metadata: Metadata = {
  title: "Agendar consultoria | Verônica Chaves — Assessoria de Moda",
  description:
    "Deixe seu nome e a sua cidade para agendar uma consultoria de moda com a Verônica Chaves. A conversa continua no WhatsApp, presencial em Belo Horizonte ou online para todo o Brasil.",
  alternates: { canonical: "/agendamento" },
  openGraph: {
    title: "Agendar consultoria | Verônica Chaves",
    description:
      "Nome, cidade e a conversa segue no WhatsApp. Atendimento presencial em BH ou online para todo o Brasil.",
    url: "/agendamento",
  },
};

/* Página de chegada de um único gesto: sem o menu do site, para o formulário
   não disputar espaço com a navegação. O caminho de volta é a marca. */
export default function AgendamentoPage() {
  return (
    <>
      <a className="skip-link" href="#conteudo-principal">
        Ir para o conteúdo
      </a>

      <header className="agendamento-topo tom-claro">
        <div className="header-inner">
          <Link href="/" className="logo">
            <span className="logo-nome">Verônica Chaves</span>
            <span className="logo-sub">Assessoria de Moda</span>
          </Link>
          <Link href="/" className="agendamento-voltar">
            ← Voltar ao site
          </Link>
        </div>
      </header>

      <main id="conteudo-principal">
        <section className="section secao-agendamento tom-claro-fundo">
          <div className="prancha">
            <Folio numero="01" rotulo="O agendamento" />

            <div className="prancha-conteudo stagger">
              <div className="cabecalho-secao reveal">
                <div className="cabecalho-secao-titulo">
                  <p className="eyebrow eyebrow--com-fio">Agendar consultoria</p>
                  <h1>
                    Vamos montar a sua <em>próxima arara</em>?
                  </h1>
                </div>
              </div>

              <p className="agendamento-nota reveal">
                Duas informações e pronto: a conversa abre no WhatsApp já
                apresentada, e a Verônica responde por lá com os horários da
                semana.
              </p>

              <AgendamentoForm />

              <p className="agendamento-local reveal">
                Atendimento presencial em Belo Horizonte · Online para todo o
                Brasil
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ConsentAnalytics />
      <ScrollReveal />
    </>
  );
}
