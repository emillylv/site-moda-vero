/**
 * Folio da prancha — o número, o fio e o rótulo vertical na margem esquerda
 * de cada seção. É o gesto que costura a página inteira como um lookbook.
 *
 * Decorativo de propósito (`aria-hidden`): quem navega por leitor de tela já
 * recebe o <h2> da seção; "PRANCHA 04" seria ruído.
 *
 * O `data-folio` é o alvo do contador em `ScrollReveal` — o número conta de
 * 00 até o valor final quando a prancha entra em quadro. Sem JS, o valor
 * renderizado pelo servidor já é o final.
 */
export function Folio({ numero, rotulo }: { numero: string; rotulo: string }) {
  return (
    <div className="folio" aria-hidden="true">
      <span className="folio-numero" data-folio={numero}>
        {numero}
      </span>
      <span className="folio-fio" />
      <span className="folio-rotulo">{rotulo}</span>
    </div>
  );
}
