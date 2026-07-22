"use client";

import { useEffect, useState } from "react";

const GOOGLE_ANALYTICS_ID = "G-F7VFWPM4LR";
const CHAVE_CONSENTIMENTO = "consentimento_cookies";

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

function iniciarAnalytics() {
  if (document.getElementById("google-analytics-script")) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("consent", "update", { analytics_storage: "granted" });
  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ANALYTICS_ID);

  const script = document.createElement("script");
  script.id = "google-analytics-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    GOOGLE_ANALYTICS_ID
  )}`;
  document.head.appendChild(script);
}

export function ConsentAnalytics() {
  const [decisao, setDecisao] = useState<"aceito" | "rejeitado" | "pendente" | null>(null);

  useEffect(() => {
    let atual: string | null = null;
    try {
      atual = localStorage.getItem(CHAVE_CONSENTIMENTO);
    } catch {
      // Armazenamento bloqueado: ainda pedimos consentimento nesta visita.
    }
    if (atual === "aceito") {
      iniciarAnalytics();
      setDecisao("aceito");
    } else if (atual === "rejeitado") {
      setDecisao("rejeitado");
    } else {
      setDecisao("pendente");
    }
  }, []);

  useEffect(() => {
    if (decisao !== "aceito") return;
    const tratarClique = (evento: MouseEvent) => {
      const link = (evento.target as Element | null)?.closest("a");
      if (!link || !window.gtag) return;
      const href = link.getAttribute("href") || "";
      const nome = href.includes("whatsapp") || href.includes("wa.me")
        ? "whatsapp_click"
        : href.includes("instagram.com")
          ? "instagram_click"
          : href === "#section-tendencias"
            ? "ver_colecao_click"
            : null;
      if (nome) window.gtag("event", nome, { event_category: "engagement" });
    };
    document.addEventListener("click", tratarClique);
    return () => document.removeEventListener("click", tratarClique);
  }, [decisao]);

  function guardar(valor: "aceito" | "rejeitado") {
    try {
      localStorage.setItem(CHAVE_CONSENTIMENTO, valor);
    } catch {
      // A escolha vale para a visita mesmo se o navegador bloquear storage.
    }
    if (valor === "aceito") iniciarAnalytics();
    setDecisao(valor);
  }

  if (decisao !== "pendente") return null;
  return (
    <aside className="cookie-banner" aria-label="Preferências de cookies">
      <p>
        Usamos analytics somente com sua autorização para entender o uso do site. <a
          href="https://policies.google.com/technologies/cookies"
          target="_blank"
          rel="noreferrer"
        >
          Saiba mais
        </a>
        .
      </p>
      <div className="cookie-banner-botoes">
        <button className="ds-button ds-button--primary ds-button--sm" type="button" onClick={() => guardar("aceito")}>
          Aceitar
        </button>
        <button className="ds-button ds-button--outline ds-button--sm" type="button" onClick={() => guardar("rejeitado")}>
          Rejeitar
        </button>
      </div>
    </aside>
  );
}
