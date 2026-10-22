import { act, renderHook } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Linking } from 'react-native';

import { createI18n } from '../../../shared/i18n/createI18n';
import type { AppLanguage } from '../../../shared/i18n/resolveLanguage';
import { useConsultationActions } from './useConsultationActions';

jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));

beforeEach(() => {
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
});
afterEach(() => {
  jest.restoreAllMocks();
  // A module mock, not a spy, so restoreAllMocks leaves it alone; drop any rejection set below.
  jest.mocked(WebBrowser.openBrowserAsync).mockReset();
});

async function renderActions(language: AppLanguage) {
  const i18n = createI18n(language);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  );
  const { result } = await renderHook(() => useConsultationActions(), { wrapper });
  return result.current;
}

describe('useConsultationActions', () => {
  test('Book appointment opens the PRD booking site in the in-app browser', async () => {
    const actions = await renderActions('en');

    await act(() => actions.bookAppointment());

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://gainmiles.simplybook.asia/v2/',
    );
  });

  test('WhatsApp us opens a chat with the ES number and the English pre-filled message', async () => {
    const actions = await renderActions('en');

    await act(() => actions.whatsAppUs());

    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://wa.me/85260300900?text=Hello%2C%20I%20would%20like%20to%20learn%20more%20about%20MPF%20information.',
    );
  });

  test('WhatsApp us uses the Chinese pre-filled message on a Chinese device', async () => {
    const actions = await renderActions('zh-HK');

    await act(() => actions.whatsAppUs());

    // "你好，我想了解更多有關強積金嘅資訊" (PRD), percent-encoded with Python's urllib.parse.quote.
    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://wa.me/85260300900?text=%E4%BD%A0%E5%A5%BD%EF%BC%8C%E6%88%91%E6%83%B3%E4%BA%86%E8%A7%A3%E6%9B%B4%E5%A4%9A%E6%9C%89%E9%97%9C%E5%BC%B7%E7%A9%8D%E9%87%91%E5%98%85%E8%B3%87%E8%A8%8A',
    );
  });

  test('the hotline opens the dialer with the PRD number', async () => {
    const actions = await renderActions('en');

    await act(() => actions.callHotline());

    expect(Linking.openURL).toHaveBeenCalledWith('tel:+85228934402');
  });

  test('the email opens the mail app addressed to the PRD email', async () => {
    const actions = await renderActions('en');

    await act(() => actions.emailUs());

    expect(Linking.openURL).toHaveBeenCalledWith('mailto:memberservice@gumhk.com');
  });

  // A device without a dialer, mail app or browser (e.g. the iOS simulator has no Phone or Mail
  // app) rejects the open. The action swallows it, so pressing a link never surfaces an
  // unhandled error; nothing is shown (SPEC §4.5).
  test.each(['bookAppointment', 'whatsAppUs', 'callHotline', 'emailUs'] as const)(
    '%s does not throw when the device cannot open the link',
    async (action) => {
      const error = new Error('Unable to open URL');
      jest.spyOn(Linking, 'openURL').mockRejectedValue(error);
      jest.mocked(WebBrowser.openBrowserAsync).mockRejectedValue(error);
      const actions = await renderActions('en');

      await expect(act(() => actions[action]())).resolves.toBeUndefined();
    },
  );
});
