// Contact values from the PRD (SPEC §4.5). Never inline these in components.
export const BOOKING_URL = 'https://gainmiles.simplybook.asia/v2/';

export const WHATSAPP_NUMBER = '85260300900';

// WhatsApp universal link in the PRD's format: https://wa.me/<number>?text=<URL-encoded message>.
export function whatsAppChatUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
