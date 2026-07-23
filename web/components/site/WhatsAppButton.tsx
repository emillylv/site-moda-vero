import { LINKS } from "@/lib/links";

export function WhatsAppButton() {
  return (
    <a
      className="whatsapp-popup"
      href={LINKS.whatsappAgendar}
      target="_blank"
      rel="noopener"
      aria-label="Falar no WhatsApp"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/imgs/ws.png" alt="" width={22} height={22} />
      {/* O rótulo some nas telas estreitas; o aria-label continua respondendo. */}
      <span>Falar no WhatsApp</span>
    </a>
  );
}
