import { caminhoImagemValido } from "@/lib/validation";
import type { LookEdicao } from "./types";

export function CatalogPreview({ itens }: { itens: LookEdicao[] }) {
  return (
    <div className="admin-coluna-preview">
      <h2>Prévia no site</h2>
      <p className="admin-preview-legenda">É assim que vai aparecer na seção Tendências.</p>

      {itens.length === 0 ? (
        <p className="admin-preview-vazio">
          A prévia vai aparecer aqui assim que você adicionar um look.
        </p>
      ) : (
        <div className="grade-tendencias admin-preview-grade">
          {itens.map((item, indice) => {
            const imagem = caminhoImagemValido(item.imagem) ? item.imagem : null;
            const imagemHover =
              caminhoImagemValido(item.imagemHover) && item.imagemHover !== imagem
                ? item.imagemHover
                : null;

            return (
              <article className="look-card em-vista" key={item.id}>
                {item.etiqueta ? <span className="look-tag">{item.etiqueta}</span> : null}
                <div className="look-card-imagem">
                  {imagem ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="imagem-base"
                        src={imagem}
                        alt={item.titulo || "Look da coleção"}
                      />
                      {imagemHover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="imagem-hover" src={imagemHover} alt="" />
                      ) : null}
                    </>
                  ) : (
                    <div className="admin-preview-sem-foto">Sem foto definida</div>
                  )}
                </div>
                <div className="look-card-legenda">
                  <p className="look-card-titulo">{item.titulo || "Sem título"}</p>
                  <span className="look-card-indice">
                    {String(indice + 1).padStart(2, "0")}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
