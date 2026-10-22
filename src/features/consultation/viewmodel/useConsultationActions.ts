import * as WebBrowser from 'expo-web-browser';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { BOOKING_URL, whatsAppChatUrl } from '../../../shared/config/contact';

// Side-effecting actions of the Consultation screen, wrapped here so they can be mocked in
// tests (SPEC §12).
export function useConsultationActions() {
  const { t } = useTranslation();

  return useMemo(
    () => ({
      // In-app browser (SFSafariViewController / Chrome Custom Tabs), which offers
      // "open in browser" itself (PRD).
      bookAppointment: async () => {
        await WebBrowser.openBrowserAsync(BOOKING_URL);
      },
      // Universal link: opens WhatsApp when installed, otherwise the browser (PRD, SPEC §4.5).
      whatsAppUs: async () => {
        await Linking.openURL(whatsAppChatUrl(t('consultation.bottomSection.whatsAppMessage')));
      },
    }),
    [t],
  );
}
