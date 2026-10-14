/** Número do WhatsApp em formato internacional, somente com dígitos. */
export const WHATSAPP_PHONE_NUMBER = "000000000";

/** Texto principal que aparecerá pré-preenchido na conversa. */
export const WHATSAPP_MESSAGE =
  "Olá! Gostaria de conversar sobre uma ideia de serigrafia.";

/** Complemento enviado na mesma mensagem para indicar a origem do contato. */
export const WHATSAPP_MESSAGE_SUBTEXT =
  "Vi os stories e quero criar um produto com identidade, técnica e atenção aos detalhes.";

/** Monta um link seguro de conversa com a mensagem codificada para a URL. */
export function createWhatsAppLink(): string {
  const phoneNumber = WHATSAPP_PHONE_NUMBER.replace(/\D/g, "");
  const message = `${WHATSAPP_MESSAGE}\n\n${WHATSAPP_MESSAGE_SUBTEXT}`;
  const query = new URLSearchParams({ text: message });

  return `https://wa.me/${phoneNumber}?${query.toString()}`;
}
