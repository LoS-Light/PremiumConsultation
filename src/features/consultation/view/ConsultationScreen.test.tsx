import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';

import type { Specialist } from '../../../data/specialist/Specialist';
import type { SpecialistRepository } from '../../../data/specialist/SpecialistRepository';
import { RepositoryProvider } from '../../../data/specialist/RepositoryProvider';
import { createI18n } from '../../../shared/i18n/createI18n';
import type { AppLanguage } from '../../../shared/i18n/resolveLanguage';
import { ConsultationScreen } from './ConsultationScreen';

const FIGMA_SPECIALISTS: Specialist[] = [
  { id: '1', name: 'Kan Chung' },
  { id: '2', name: 'Alisa Mak' },
  { id: '3', name: 'Justin Liu' },
];

// A fake repository that answers at once with the given Specialists.
function fakeRepository(specialists: Specialist[]): SpecialistRepository {
  return {
    getSpecialists: async ({ offset, limit }) => ({
      items: specialists.slice(offset, offset + limit),
      offset,
      limit,
      total: specialists.length,
    }),
  };
}

async function renderScreen(
  language: AppLanguage,
  repository: SpecialistRepository = fakeRepository(FIGMA_SPECIALISTS),
) {
  // A fresh QueryClient per test, with retries off (SPEC §13). gcTime: Infinity stops the
  // cache from scheduling a clean-up timer that would keep Jest from exiting.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  await render(
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider repository={repository}>
        <I18nextProvider i18n={createI18n(language)}>
          <ConsultationScreen />
        </I18nextProvider>
      </RepositoryProvider>
    </QueryClientProvider>,
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

// A repository whose request never finishes, to hold the screen in its loading state.
const pendingRepository: SpecialistRepository = {
  getSpecialists: () => new Promise(() => {}),
};

describe('ConsultationScreen Specialist list', () => {
  test('shows skeleton cards while the Specialists load', async () => {
    await renderScreen('en', pendingRepository);

    expect(screen.getAllByTestId('specialist-skeleton').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('specialist-name')).not.toBeOnTheScreen();
  });

  test('shows the empty state when there are no Specialists', async () => {
    await renderScreen('en', fakeRepository([]));

    expect(await screen.findByText('No Specialists are available right now.')).toBeOnTheScreen();
    expect(screen.queryByText('Retry')).not.toBeOnTheScreen();
  });

  test('does not claim there are no Specialists when loading fails', async () => {
    const failingRepository: SpecialistRepository = {
      getSpecialists: () => Promise.reject(new Error('network down')),
    };
    await renderScreen('en', failingRepository);

    await waitFor(() => expect(screen.queryByTestId('specialist-skeleton')).not.toBeOnTheScreen());
    expect(screen.queryByText('No Specialists are available right now.')).not.toBeOnTheScreen();
  });

  test('lists the Specialists in data-source order', async () => {
    await renderScreen('en');

    const names = await screen.findAllByTestId('specialist-name');
    expect(names).toHaveLength(3);
    expect(names[0]).toHaveTextContent('Kan Chung');
    expect(names[1]).toHaveTextContent('Alisa Mak');
    expect(names[2]).toHaveTextContent('Justin Liu');
  });
});
