import { LINKS } from "@/lib/links";

export function About() {
  return (
    <section className="section secao-sobre" id="title-sobre">
      <h2>Sobre</h2>
      <div className="sobre-conteudo">
        <div className="sobre-foto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/imgs/veronica.jpg" alt="Verônica Chaves, consultora de moda" />
        </div>
        <div className="sobre-texto">
          <p className="eyebrow">Consultora de Moda · Belo Horizonte</p>
          <p className="sobre-nome">Verônica Chaves</p>
          <p>
            Consultora de moda em Belo Horizonte, atuo ajudando lojistas e pessoas a
            expressarem sua identidade por meio do vestir. Acredito que a moda é uma
            ferramenta poderosa para transmitir mensagens e abrir portas.
          </p>
          <p>
            Agende sua consulta personalizada e receba uma curadoria exclusiva de peças de
            alta qualidade, escolhidas especialmente para você — com envio gratuito para todo o
            Brasil.
          </p>
          <a
            href={LINKS.whatsappAgendar}
            className="btn btn-primario"
            target="_blank"
            rel="noopener"
          >
            Falar com a Verônica
          </a>
        </div>
      </div>
    </section>
  );
}
