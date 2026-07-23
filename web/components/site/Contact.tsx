import { LINKS } from "@/lib/links";
import { Folio } from "./Folio";

export function Contact({ numeroPrancha }: { numeroPrancha: string }) {
  return (
    <section
      className="section secao-contato tom-claro-fundo"
      id="contato"
    >
      <div className="prancha">
        <Folio numero={numeroPrancha} rotulo="O fecho" />

        <div className="prancha-conteudo stagger">
          <div className="cabecalho-secao reveal">
            <div className="cabecalho-secao-titulo">
              <p className="eyebrow eyebrow--com-fio">Próxima temporada</p>
              <h2>
                Vamos montar a sua <em>próxima arara</em>?
              </h2>
            </div>
          </div>
          <p className="contato-nota reveal">
            Me chama no WhatsApp e eu te mostro a coleção completa, com envio
            gratuito para todo o Brasil.
          </p>
          <div className="contato-acoes reveal">
            <a
              href={LINKS.whatsappAgendar}
              className="btn btn-primario btn-grande"
              target="_blank"
              rel="noopener"
            >
              Agendar pelo WhatsApp
              <span className="btn-seta" aria-hidden="true">
                →
              </span>
            </a>
            <a
              href={LINKS.instagram}
              className="btn btn-secundario btn-grande"
              target="_blank"
              rel="noopener"
            >
              Ver o Instagram
            </a>
          </div>
          <p className="contato-local reveal">
            Atendimento presencial em Belo Horizonte · Online para todo o Brasil
          </p>
        </div>
      </div>
    </section>
  );
}
