import Link from "next/link";

export function WhatsAppButton() {
  return (
    <Link
      className="whatsapp-popup"
      href="/agendamento"
      aria-label="Falar no WhatsApp"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/imgs/ws.png" alt="" width={22} height={22} />
      {/* O rótulo some nas telas estreitas; o aria-label continua respondendo. */}
      <span>Falar no WhatsApp</span>
    </Link>
  );
}
