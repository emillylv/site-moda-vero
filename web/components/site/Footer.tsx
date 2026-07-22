import { LINKS } from "@/lib/links";

export function Footer() {
  const ano = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-marca">Verônica Chaves · {ano}</p>
        <p className="footer-local">Belo Horizonte, MG</p>
        <p className="footer-icones">
          <a href={LINKS.instagram} target="_blank" rel="noopener" aria-label="Instagram">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="icone" src="/imgs/insta.png" alt="" />
          </a>
          <a href={LINKS.whatsappSimples} target="_blank" rel="noopener" aria-label="WhatsApp">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="icone" src="/imgs/ws.png" alt="" />
          </a>
        </p>
      </div>
    </footer>
  );
}
