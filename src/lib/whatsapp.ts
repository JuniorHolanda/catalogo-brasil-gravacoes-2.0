/** Número do WhatsApp em formato internacional, somente com dígitos. */
export const WHATSAPP_PHONE_NUMBER = "000000000";

/** Texto principal que aparecerá pré-preenchido na conversa. */
export const WHATSAPP_MESSAGE =
  "Olá! Gostaria de conversar sobre uma ideia de serigrafia.";

/** Complemento enviado na mesma mensagem para indicar a origem do contato. */
export const WHATSAPP_MESSAGE_SUBTEXT =
  "Vi os stories e quero criar um produto com identidade, técnica e atenção aos detalhes.";

/** Monta um link seguro e opcionalmente identifica o serviço na mensagem. */
export function createWhatsAppLink(serviceName?: string): string {
  const phoneNumber = WHATSAPP_PHONE_NUMBER.replace(/\D/g, "");
  const message = serviceName
    ? `Olá! Gostaria de solicitar um orçamento para ${serviceName}.`
    : `${WHATSAPP_MESSAGE}\n\n${WHATSAPP_MESSAGE_SUBTEXT}`;
  const query = new URLSearchParams({ text: message });

  return `https://wa.me/${phoneNumber}?${query.toString()}`;
}
