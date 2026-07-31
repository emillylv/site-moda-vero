"use client";

import { useEffect, useRef } from "react";

/* O filme da capa entra no lugar da fotografia, mas continua sendo cenário:
   sem áudio, em loop e fora da árvore de acessibilidade — quem lê a página é a
   manchete. Se o visitante pediu menos movimento, ele congela no primeiro
   quadro, que é exatamente o poster. */
export function HeroVideo({ poster }: { poster: string }) {
  const referencia = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = referencia.current;
    if (!video) return;
    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");

    const aplicarPreferencia = () => {
      if (consulta.matches) {
        video.pause();
        video.currentTime = 0;
        return;
      }
      // O autoplay pode ser recusado (economia de bateria, por exemplo). Sem o
      // catch a promessa virava rejeição não tratada; recusado, fica o poster.
      void video.play().catch(() => {});
    };

    aplicarPreferencia();
    consulta.addEventListener("change", aplicarPreferencia);
    return () => consulta.removeEventListener("change", aplicarPreferencia);
  }, []);

  return (
    <video
      ref={referencia}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    >
      {/* VP9 primeiro: mesma qualidade em arquivo menor onde houver suporte. */}
      <source src="/videos/capa.webm" type="video/webm" />
      <source src="/videos/capa.mp4" type="video/mp4" />
    </video>
  );
}
