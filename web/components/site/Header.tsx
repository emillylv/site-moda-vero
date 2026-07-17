"use client";

import { useEffect, useState } from "react";
import { LINKS } from "@/lib/links";

const NAV = [
  { href: "#section-tendencias", rotulo: "Coleção" },
  { href: "#como-funciona", rotulo: "Como funciona" },
  { href: "#marcas", rotulo: "Marcas" },
  { href: "#title-sobre", rotulo: "Sobre" },
];

export function Header() {
  const [aberto, setAberto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Sombra/compactação sutil do cabeçalho ao rolar a página.
  useEffect(() => {
    const aoRolar = () => setScrolled(window.scrollY > 12);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  return (
    <header className={`site-header${scrolled ? " scrolled" : ""}`}>
      <div className="header-inner">
        <a href="#topo" className="logo" onClick={() => setAberto(false)}>
          <span className="logo-nome">Verônica Chaves</span>
          <span className="logo-sub">Assessoria de Moda</span>
        </a>

        <button
          className={`menu-toggle${aberto ? " ativo" : ""}`}
          aria-expanded={aberto}
          aria-controls="nav-principal"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          onClick={() => setAberto((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav id="nav-principal" className={`nav-principal${aberto ? " aberto" : ""}`}>
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setAberto(false)}>
                  {item.rotulo}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={LINKS.whatsappAgendar}
            className="btn btn-primario nav-cta"
            target="_blank"
            rel="noopener"
            onClick={() => setAberto(false)}
          >
            Agendar
          </a>
        </nav>
      </div>
    </header>
  );
}
