import { LINKS } from "@/lib/links";
import { Folio } from "./Folio";

export function About({ numeroPrancha }: { numeroPrancha: string }) {
  return (
    <section className="section secao-sobre tom-claro" id="title-sobre">
      <div className="prancha">
        <Folio numero={numeroPrancha} rotulo="A assessora" />

        <div className="prancha-conteudo">
          <div className="sobre-conteudo">
            <div className="sobre-foto">
              {/* O quadro é o que recebe a cortina — a moldura deslocada fica
                  fora dele, senão o clip-path cortaria justamente a moldura. */}
              <div className="sobre-foto-quadro reveal reveal--cortina">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/imgs/veronica.jpg"
                  alt="Verônica Chaves, consultora de moda"
                  width={720}
                  height={720}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
            <div className="sobre-texto reveal reveal--right">
              <p className="eyebrow eyebrow--com-fio">
                Consultora de moda · Belo Horizonte
              </p>
              <p className="sobre-nome">Verônica Chaves</p>
              <p className="sobre-citacao">
                A moda é uma ferramenta poderosa para transmitir mensagens e
                abrir portas.
              </p>
              <p>
                Atuo ajudando lojistas e pessoas a expressarem sua identidade
                por meio do vestir — escolhendo peça por peça o que combina com
                a sua loja e com quem entra nela.
              </p>
              <p>
                Agende sua consulta personalizada e receba uma curadoria
                exclusiva de peças de alta qualidade, escolhidas especialmente
                para você, com envio gratuito para todo o Brasil.
              </p>
              <a
                href={LINKS.whatsappAgendar}
                className="btn btn-primario"
                target="_blank"
                rel="noopener"
              >
                Falar com a Verônica
                <span className="btn-seta" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
