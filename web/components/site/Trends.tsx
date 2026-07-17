"use client";

import { useEffect, useRef } from "react";
import type { Colecao } from "@/lib/trends";
import { LINKS } from "@/lib/links";

export function Trends({ colecao }: { colecao: Colecao }) {
  const gradeRef = useRef<HTMLDivElement>(null);

  // Animação de entrada dos cards ao entrar na viewport.
  useEffect(() => {
    const grade = gradeRef.current;
    if (!grade) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("em-vista");
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    grade.querySelectorAll(".look-card").forEach((card) => observador.observe(card));
    return () => observador.disconnect();
  }, [colecao]);

  const itens = colecao.itens.filter((item) => item.imagem);

  return (
    <section className="section secao-tendencias" id="section-tendencias">
      <div className="cabecalho-secao">
        <h2>Tendências</h2>
        <p className="subtitulo-colecao">
          Coleção <span>{colecao.colecao || "atual"}</span>
        </p>
      </div>

      <div ref={gradeRef} className="grade-tendencias">
        {itens.map((item, indice) => {
          const numero = String(indice + 1).padStart(2, "0");
          const temHover = item.imagemHover && item.imagemHover !== item.imagem;
          return (
            <article className="look-card" key={`${item.imagem}-${indice}`}>
              {item.etiqueta ? <span className="look-tag">{item.etiqueta}</span> : null}
              <div className="look-card-imagem">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="imagem-base"
                  src={item.imagem}
                  alt={item.titulo || "Look da coleção"}
                  loading="lazy"
                />
                {temHover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="imagem-hover" src={item.imagemHover} alt="" loading="lazy" />
                ) : null}
              </div>
              <div className="look-card-legenda">
                <p className="look-card-titulo">{item.titulo || ""}</p>
                <span className="look-card-indice">{numero}</span>
              </div>
            </article>
          );
        })}
      </div>

      <p className="link-colecao">
        Quer ver a coleção completa?{" "}
        <a href={LINKS.whatsappColecao} target="_blank" rel="noopener">
          fale pelo WhatsApp
        </a>
        .
      </p>
    </section>
  );
}
