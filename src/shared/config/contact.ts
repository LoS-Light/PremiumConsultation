// Contact values from the PRD (SPEC §4.5). Never inline these in components.
export const BOOKING_URL = 'https://gainmiles.simplybook.asia/v2/';

const WHATSAPP_NUMBER = '85260300900';

// WhatsApp universal link in the PRD's format: https://wa.me/<number>?text=<URL-encoded message>.
export function whatsAppChatUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// General enquiries (PRD Contact Info).
export const HOTLINE_DISPLAY = '+852 2893 4402';
// The dialer gets the same number without spaces, so the two can never disagree.
export const HOTLINE_DIAL = HOTLINE_DISPLAY.replace(/\s/g, '');
export const EMAIL = 'memberservice@gumhk.com';
