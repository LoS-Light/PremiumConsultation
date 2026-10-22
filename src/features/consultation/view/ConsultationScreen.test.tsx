import { fireEvent, render, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';

import { createI18n } from '../../../shared/i18n/createI18n';
import type { AppLanguage } from '../../../shared/i18n/resolveLanguage';
import { ConsultationScreen } from './ConsultationScreen';

async function renderScreen(language: AppLanguage) {
  await render(
    <I18nextProvider i18n={createI18n(language)}>
      <ConsultationScreen />
    </I18nextProvider>,
  );
}

describe('ConsultationScreen header', () => {
  test('shows the PRD title block in English', async () => {
    await renderScreen('en');

    expect(screen.getByText('Got more questions?')).toBeOnTheScreen();
    expect(screen.getByText('GUM Specialists are here!')).toBeOnTheScreen();
    expect(
      screen.getByText(
        "We provide professional, impartial advice to help you find what's best for you",
      ),
    ).toBeOnTheScreen();
  });

  test('shows the PRD title block in Chinese (Hong Kong)', async () => {
    await renderScreen('zh-HK');

    expect(screen.getByText('有更多問題嗎？')).toBeOnTheScreen();
    expect(screen.getByText('GUM 專家為你服務！')).toBeOnTheScreen();
    expect(
      screen.getByText('我們提供專業同中立嘅意見， 幫你作出最合適嘅選擇 。'),
    ).toBeOnTheScreen();
  });
});

describe('ConsultationScreen back button', () => {
  // In v1.0.0 the icon is decorative and has no press handler, so this only proves it is
  // drawn and that pressing it leaves the screen as it was. It gains weight in v1.1.0
  // (T-0009), when the back button navigates to Home.
  test('is shown but pressing it does nothing (PRD)', async () => {
    await renderScreen('en');

    // The icon is decorative (hidden from screen readers), so include hidden elements.
    await fireEvent.press(screen.getByTestId('consultation-back', { includeHiddenElements: true }));

    expect(screen.getByText('GUM Specialists are here!')).toBeOnTheScreen();
  });
});
