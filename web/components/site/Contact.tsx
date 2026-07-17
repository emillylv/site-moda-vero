import { LINKS } from "@/lib/links";

export function Contact() {
  return (
    <section className="section secao-contato" id="contato">
      <h2>Vamos conversar?</h2>
      <p>
        Atendimento online ou presencial em Belo Horizonte, com envio para todo o Brasil.
      </p>
      <div className="contato-acoes">
        <a
          href={LINKS.whatsappAgendar}
          className="btn btn-primario"
          target="_blank"
          rel="noopener"
        >
          WhatsApp
        </a>
        <a href={LINKS.instagram} className="btn btn-secundario" target="_blank" rel="noopener">
          Instagram
        </a>
      </div>
    </section>
  );
}
