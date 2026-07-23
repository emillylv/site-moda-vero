import { Folio } from "./Folio";

const MARCAS = [
  { src: "/imgs/annefernandes.jpg", alt: "Anne Fernandes" },
  { src: "/imgs/caos.jpg", alt: "Caos" },
  { src: "/imgs/frutacor.jpg", alt: "Fruta Cor" },
  { src: "/imgs/iorane.jpg", alt: "Iorane" },
  { src: "/imgs/ln.jpg", alt: "LN" },
  { src: "/imgs/reginasalomao.png", alt: "Regina Salomão" },
  { src: "/imgs/skazi.png", alt: "Skazi" },
  { src: "/imgs/thamaracapelao.jpg", alt: "Thamara Capelão" },
  { src: "/imgs/tufiduek.jpg", alt: "Tufi Duek" },
];

export function Brands({ numeroPrancha }: { numeroPrancha: string }) {
  // Renderiza a lista duas vezes para a rolagem contínua (a 2ª cópia é decorativa).
  return (
    <section className="section secao-marcas tom-claro-fundo" id="marcas">
      <div className="prancha">
        <Folio numero={numeroPrancha} rotulo="A curadoria" />

        <div className="prancha-conteudo">
          <div className="cabecalho-secao reveal">
            <div className="cabecalho-secao-titulo">
              <p className="eyebrow eyebrow--com-fio">Quem vem na curadoria</p>
              <h2>Principais marcas</h2>
            </div>
          </div>
          <div className="carrossel-marcas">
            <div className="marcas-imgs">
              {MARCAS.map((m) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="marca"
                  key={m.alt}
                  src={m.src}
                  alt={m.alt}
                  loading="lazy"
                  decoding="async"
                />
              ))}
              {MARCAS.map((m) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="marca"
                  key={`clone-${m.alt}`}
                  src={m.src}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
