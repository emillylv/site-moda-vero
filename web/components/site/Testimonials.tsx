import { depoimentos } from "@/lib/depoimentos";
import { Folio } from "./Folio";

/**
 * Prancha de prova social.
 *
 * Devolve `null` enquanto `data/depoimentos.json` estiver vazio — nada de
 * placeholder no ar, nada de depoimento inventado. A seção existe pronta
 * para o dia em que a Verônica mandar as frases reais das lojistas.
 */
export function Testimonials({ numeroPrancha }: { numeroPrancha: string }) {
  if (depoimentos.length === 0) return null;

  return (
    <section
      className="section secao-depoimentos tom-claro-fundo"
      id="depoimentos"
    >
      <div className="prancha">
        <Folio numero={numeroPrancha} rotulo="As lojistas" />

        <div className="prancha-conteudo">
          <div className="cabecalho-secao reveal">
            <div className="cabecalho-secao-titulo">
              <p className="eyebrow eyebrow--com-fio">Quem já montou a arara</p>
              <h2>O que dizem as lojistas</h2>
            </div>
          </div>

          <div className="grade-depoimentos stagger">
            {depoimentos.map((item) => (
              <figure className="depoimento reveal" key={`${item.nome}-${item.texto}`}>
                <span className="depoimento-aspas" aria-hidden="true">
                  “
                </span>
                <blockquote className="depoimento-texto">{item.texto}</blockquote>
                <figcaption className="depoimento-assinatura">
                  <span className="depoimento-nome">{item.nome}</span>
                  {item.loja || item.cidade ? (
                    <span className="depoimento-loja">
                      {[item.loja, item.cidade].filter(Boolean).join(" · ")}
                    </span>
                  ) : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
