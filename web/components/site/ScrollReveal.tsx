"use client";

import { useEffect } from "react";

/**
 * Ativa o scroll-reveal da página:
 * - marca <html> com `reveal-enabled` (os estados ocultos só valem com JS);
 * - revela cada elemento `.reveal` quando entra na viewport (uma única vez).
 * Respeita prefers-reduced-motion (o CSS já neutraliza o movimento).
 */
export function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("reveal-enabled");

    const alvos = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    const prefereMenos = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefereMenos || !("IntersectionObserver" in window)) {
      alvos.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("is-visible");
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
        el.classList.add("is-visible");
      } else {
        observador.observe(el);
      }
    });

    return () => observador.disconnect();
  }, []);

  return null;
}
