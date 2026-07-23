import { LINKS } from "@/lib/links";
import { Folio } from "./Folio";

// Razões para continuar rolando, logo abaixo da capa. Todas verificáveis no
// próprio site: envio gratuito, atendimento híbrido e as 9 marcas da arara.
const PROVAS = [
  { valor: "Grátis", rotulo: "Envio para todo o Brasil" },
  { valor: "BH + online", rotulo: "Presencial ou a distância" },
  { valor: "9 marcas", rotulo: "Na curadoria da temporada" },
];

export function Hero({ colecao }: { colecao?: string }) {
  return (
    <>
      <section className="hero tom-claro" id="topo">
        <div className="hero-midia">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/imgs/capa.jpg"
            alt="Duas modelos à beira da piscina com looks da coleção de verão"
            width={1500}
            height={750}
            fetchPriority="high"
            decoding="async"
          />
          <div className="hero-veu" aria-hidden="true" />
        </div>

        {/* A costura da revista: só existe acima de 1081px, onde há dobra. */}
        <div className="hero-dobra" aria-hidden="true" />

        <div className="hero-prancha">
          <Folio
            numero="01"
            rotulo={colecao ? `Edição ${colecao}` : "A capa"}
          />

          <div className="hero-conteudo">
            <p className="eyebrow eyebrow--com-fio">
              Assessoria de moda · Belo Horizonte
            </p>

            {/* As linhas são explícitas: a quebra é decisão de direção de arte
                (nada de viúva no meio da frase) e cada linha é a unidade da
                animação de entrada. O fecho em itálico atravessa a dobra. */}
            <h1 className="hero-manchete">
              <span className="hero-linha">
                <span>A arara</span>
              </span>
              <span className="hero-linha">
                <span>que a sua</span>
              </span>
              <span className="hero-linha">
                <span>cliente</span>
              </span>
              <em className="hero-linha hero-linha--fecho">
                <span>não resiste.</span>
              </em>
            </h1>

            <p className="hero-sub">
              Consultoria personalizada para lojistas: peças selecionadas a
              dedo, tendências atualizadas e envio gratuito para todo o Brasil.
            </p>
            <div className="hero-acoes">
              <a
                href={LINKS.whatsappAgendar}
                className="btn btn-primario"
                target="_blank"
                rel="noopener"
              >
                Agendar consultoria
                <span className="btn-seta" aria-hidden="true">
                  →
                </span>
              </a>
              <a href="#section-tendencias" className="btn btn-secundario">
                Ver a coleção
              </a>
            </div>
            <a
              className="hero-insta"
              href={LINKS.instagram}
              target="_blank"
              rel="noopener"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/imgs/insta.png" alt="" width={15} height={15} />
              @moda_bh_vero
            </a>
          </div>
        </div>
      </section>

      <div className="faixa-prova tom-claro-fundo">
        <div className="faixa-prova-inner">
          {PROVAS.map((prova) => (
            <div className="faixa-prova-item" key={prova.rotulo}>
              <span className="faixa-prova-valor">{prova.valor}</span>
              <span className="faixa-prova-rotulo">{prova.rotulo}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
