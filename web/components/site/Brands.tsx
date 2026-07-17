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

export function Brands() {
  // Renderiza a lista duas vezes para a rolagem contínua (a 2ª cópia é decorativa).
  return (
    <section className="section secao-marcas" id="marcas">
      <h2 className="reveal">Principais marcas</h2>
      <div className="carrossel-marcas">
        <div className="marcas-imgs">
          {MARCAS.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="marca" key={m.alt} src={m.src} alt={m.alt} loading="lazy" />
          ))}
          {MARCAS.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="marca"
              key={`clone-${m.alt}`}
              src={m.src}
              alt=""
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
