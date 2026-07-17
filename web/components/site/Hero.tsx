import { LINKS } from "@/lib/links";

export function Hero() {
  return (
    <section className="hero" id="topo">
      <div className="hero-texto">
        <p className="eyebrow">Assessoria de moda · Belo Horizonte</p>
        <h1>Moda de atacado com a curadoria certa para a sua loja</h1>
        <p className="hero-sub">
          Consultoria personalizada para lojistas: peças selecionadas a dedo, tendências
          atualizadas e envio gratuito para todo o Brasil.
        </p>
        <div className="hero-acoes">
          <a
            href={LINKS.whatsappAgendar}
            className="btn btn-primario"
            target="_blank"
            rel="noopener"
          >
            Agendar consultoria
          </a>
          <a href="#section-tendencias" className="btn btn-secundario">
            Ver coleção atual
          </a>
        </div>
        <a className="hero-insta" href={LINKS.instagram} target="_blank" rel="noopener">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/imgs/insta.png" alt="" width={18} height={18} />
          @moda_bh_vero
        </a>
      </div>
      <div className="hero-imagem">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/imgs/capa.jpg"
          alt="Modelos com looks de moda em dia de verão, referência da consultoria"
        />
      </div>
    </section>
  );
}
