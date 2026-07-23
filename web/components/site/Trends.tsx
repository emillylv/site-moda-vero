"use client";

import { useEffect, useRef } from "react";
import type { Colecao } from "@/lib/trends";
import { LINKS, whatsapp } from "@/lib/links";
import { Folio } from "./Folio";

export function Trends({
  colecao,
  numeroPrancha,
}: {
  colecao: Colecao;
  numeroPrancha: string;
}) {
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
    <section
      className="section secao-tendencias tom-escuro ladrilhado"
      id="section-tendencias"
    >
      <div className="prancha">
        <Folio numero={numeroPrancha} rotulo="A vitrine" />

        <div className="prancha-conteudo">
          <div className="cabecalho-secao reveal">
            <div className="cabecalho-secao-titulo">
              <p className="eyebrow eyebrow--com-fio">A coleção da temporada</p>
              <h2>Tendências</h2>
            </div>
            <p className="subtitulo-colecao">
              {colecao.colecao || "Coleção atual"}
            </p>
          </div>

          <div ref={gradeRef} className="grade-tendencias">
            {itens.map((item, indice) => {
              const numero = String(indice + 1).padStart(2, "0");
              const temHover = Boolean(
                item.imagemHover && item.imagemHover !== item.imagem
              );
              const titulo = item.titulo || "Look da coleção";
              return (
                // Cada look leva direto à conversa já com o nome da peça
                // escrito: é o caminho mais curto entre ver e pedir.
                <a
                  className={`look-card${temHover ? " look-card--duplo" : ""}`}
                  key={`${item.imagem}-${indice}`}
                  href={whatsapp(
                    `Olá, Verônica! Vim pelo site e quero saber mais sobre o look "${titulo}".`
                  )}
                  target="_blank"
                  rel="noopener"
                >
                  <div className="look-card-imagem">
                    {item.etiqueta ? (
                      <span className="look-tag">{item.etiqueta}</span>
                    ) : null}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="imagem-base"
                      src={item.imagem}
                      alt={titulo}
                      width={1000}
                      height={1500}
                      loading="lazy"
                      decoding="async"
                    />
                    {temHover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="imagem-hover"
                        src={item.imagemHover}
                        alt=""
                        width={1000}
                        height={1500}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                    <span className="look-card-convite" aria-hidden="true">
                      <span>Quero este look</span>
                      <span>→</span>
                    </span>
                  </div>
                  <div className="look-card-legenda">
                    <span className="look-card-indice">{numero}</span>
                    <span className="look-card-titulo">{item.titulo || ""}</span>
                  </div>
                </a>
              );
            })}
          </div>

          <p className="link-colecao reveal">
            A arara completa não cabe aqui.{" "}
            <a href={LINKS.whatsappColecao} target="_blank" rel="noopener">
              Peça o catálogo no WhatsApp
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
