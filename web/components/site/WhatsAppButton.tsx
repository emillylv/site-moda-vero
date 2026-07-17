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
      <img src="/imgs/ws.png" alt="" width={28} height={28} />
    </a>
  );
}
