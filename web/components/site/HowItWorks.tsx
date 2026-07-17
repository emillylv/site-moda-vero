const PASSOS = [
  {
    numero: "01",
    titulo: "Agende sua consulta",
    texto:
      "Marque um horário online ou presencial, no dia e formato que ficar melhor para você.",
  },
  {
    numero: "02",
    titulo: "Curadoria exclusiva",
    texto:
      "Peças de alta qualidade são selecionadas especialmente para o perfil da sua loja e das suas clientes.",
  },
  {
    numero: "03",
    titulo: "Receba em casa",
    texto:
      "Envio gratuito para todo o Brasil, com acompanhamento da consultoria do início ao fim.",
  },
];

export function HowItWorks() {
  return (
    <section className="section secao-como-funciona" id="como-funciona">
      <h2>Como funciona</h2>
      <div className="passos">
        {PASSOS.map((passo) => (
          <div className="passo" key={passo.numero}>
            <span className="passo-numero">{passo.numero}</span>
            <h3>{passo.titulo}</h3>
            <p>{passo.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
