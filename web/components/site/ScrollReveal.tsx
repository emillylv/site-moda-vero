"use client";

import { useEffect } from "react";

/** Duração da contagem do número da prancha. Curta: é um folio, não um placar. */
const DURACAO_CONTAGEM = 520;

/**
 * Conta o número do folio de 00 até o valor final.
 * A largura do elemento está travada em `2ch` no CSS, então trocar o texto
 * não empurra o fio nem causa layout shift.
 */
function contarFolio(elemento: HTMLElement) {
  const alvo = Number(elemento.dataset.folio);
  if (!Number.isFinite(alvo) || alvo <= 0) return;

  const inicio = performance.now();
  const passo = (agora: number) => {
    const progresso = Math.min(1, (agora - inicio) / DURACAO_CONTAGEM);
    const valor = Math.round(progresso * alvo);
    elemento.textContent = String(valor).padStart(2, "0");
    if (progresso < 1) requestAnimationFrame(passo);
  };

  elemento.textContent = "00";
  requestAnimationFrame(passo);
}

/**
 * Ativa o sistema de movimento da página:
 * - marca <html> com `reveal-enabled` (os estados ocultos só valem com JS);
 * - revela cada `.reveal` quando entra na viewport (uma única vez);
 * - acende cada `.folio` — o fio cresce e o número conta até a prancha.
 *
 * Respeita `prefers-reduced-motion`: nesse caso tudo já nasce visível e o
 * contador nem roda (o número final já veio do servidor).
 */
export function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("reveal-enabled");

    const alvos = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal, .folio")
    );

    const prefereMenos = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefereMenos || !("IntersectionObserver" in window)) {
      alvos.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const acender = (elemento: HTMLElement) => {
      elemento.classList.add("is-visible");
      if (elemento.classList.contains("folio")) {
        const numero = elemento.querySelector<HTMLElement>("[data-folio]");
        if (numero) contarFolio(numero);
      }
    };

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            acender(entrada.target as HTMLElement);
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    alvos.forEach((el) => {
      // Elementos já visíveis no carregamento aparecem sem esperar o scroll.
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        acender(el);
      } else {
        observador.observe(el);
      }
    });

    return () => observador.disconnect();
  }, []);

  return null;
}
