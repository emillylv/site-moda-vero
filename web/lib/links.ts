/* Links externos da marca (WhatsApp / Instagram), centralizados. */

const WHATSAPP_NUMERO = "5531997433369";

/** O mesmo número em E.164, para `tel:` e para os dados estruturados. */
export const WHATSAPP_TELEFONE_E164 = `+${WHATSAPP_NUMERO}`;

export function whatsapp(mensagem?: string): string {
  const base = `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMERO}`;
  const texto = mensagem ? `&text=${encodeURIComponent(mensagem)}` : "&text";
  return `${base}${texto}&type=phone_number&app_absent=0`;
}

export const LINKS = {
  instagram: "https://www.instagram.com/moda_bh_vero/",
  whatsappAgendar: whatsapp(
    "Olá, Verônica! Vim pelo site e gostaria de agendar uma consultoria."
  ),
  whatsappColecao: whatsapp("Olá, Verônica! Quero ver a coleção completa de looks."),
  whatsappSimples: whatsapp(),
};
