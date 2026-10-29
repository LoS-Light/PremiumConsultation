import * as WebBrowser from 'expo-web-browser';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { BOOKING_URL, EMAIL, HOTLINE_DIAL, whatsAppChatUrl } from '../../../shared/config/contact';

// Opening fails when the device has no app for the link (no dialer or mail app, e.g. the iOS
// simulator). Nothing is shown then (SPEC §4.5), and the rejection must not go unhandled.
async function openIgnoringFailure(open: () => Promise<unknown>): Promise<void> {
  try {
    await open();
  } catch {
    // Nothing to do: the user stays on the screen.
  }
}

// Side-effecting actions of the Consultation screen, wrapped here so they can be mocked in
// tests (SPEC §12).
export function useConsultationActions() {
  const { t } = useTranslation();

  return useMemo(
    () => ({
      // In-app browser (SFSafariViewController / Chrome Custom Tabs), which offers
      // "open in browser" itself (PRD).
      bookAppointment: () => openIgnoringFailure(() => WebBrowser.openBrowserAsync(BOOKING_URL)),
      // Universal link: opens WhatsApp when installed, otherwise the browser (PRD, SPEC §4.5).
      whatsAppUs: () =>
        openIgnoringFailure(() =>
          Linking.openURL(whatsAppChatUrl(t('consultation.bottomSection.whatsAppMessage'))),
        ),
      // Dialer with the number filled in (PRD).
      callHotline: () => openIgnoringFailure(() => Linking.openURL(`tel:${HOTLINE_DIAL}`)),
      // Mail app with the recipient filled in (PRD).
      emailUs: () => openIgnoringFailure(() => Linking.openURL(`mailto:${EMAIL}`)),
    }),
    [t],
  );
}
