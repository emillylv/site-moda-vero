/* =========================================================================
   Identificadores de medição do Google e os disparos que o site registra.
   Ficam aqui — e não dentro de ConsentAnalytics — porque o formulário de
   /agendamento também precisa registrar a mesma conversão: o rótulo do Ads
   não pode divergir entre os dois pontos de contato.
   ========================================================================= */

export const GOOGLE_ANALYTICS_ID = "G-F7VFWPM4LR";
export const GOOGLE_ADS_ID = "AW-11184553318";
export const GOOGLE_ADS_CONVERSION_LABEL = "4jyACIONoNQcEOb6mtUp";

declare global {
  interface Window {
    dataLayer?: IArguments[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Registra o pedido de agendamento que segue para o WhatsApp.
 *
 * Nas páginas com CTA em forma de link o ConsentAnalytics já reconhece o
 * clique pelo href; o formulário envia por um <button>, então precisa avisar
 * explicitamente. Sem consentimento não existe `window.gtag` e nada é enviado.
 */
export function registrarAgendamentoWhatsapp(): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "whatsapp_click", { event_category: "engagement" });
  window.gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
  });
}
