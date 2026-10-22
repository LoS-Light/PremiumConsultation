import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { Linking } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { type RootStackParamList, RootNavigator } from '../../../app/navigation';
import type { Specialist } from '../../../data/specialist/Specialist';
import type { SpecialistRepository } from '../../../data/specialist/SpecialistRepository';
import { RepositoryProvider } from '../../../data/specialist/RepositoryProvider';
import { createI18n } from '../../../shared/i18n/createI18n';
import type { AppLanguage } from '../../../shared/i18n/resolveLanguage';

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

// Renders the app's navigator, opened on the Consultation screen unless told otherwise.
async function renderScreen(
  language: AppLanguage,
  repository: SpecialistRepository = fakeRepository(FIGMA_SPECIALISTS),
  initialRouteName: keyof RootStackParamList = 'Consultation',
) {
  // A fresh QueryClient per test, with retries off (SPEC §13). gcTime: Infinity stops the
  // cache from scheduling a clean-up timer that would keep Jest from exiting.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  await render(
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider repository={repository}>
          <I18nextProvider i18n={createI18n(language)}>
            <NavigationContainer>
              <RootNavigator initialRouteName={initialRouteName} />
            </NavigationContainer>
          </I18nextProvider>
        </RepositoryProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>,
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
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns to Home', async () => {
    await renderScreen('en', undefined, 'Home');
    await fireEvent.press(screen.getByText('Premium consultation'));
    expect(await screen.findByText('GUM Specialists are here!')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));

    await waitFor(() =>
      expect(screen.queryByText('GUM Specialists are here!')).not.toBeOnTheScreen(),
    );
    expect(screen.getByText('Premium consultation')).toBeOnTheScreen();
  });

  test('opens again after a back that interrupts the opening transition', async () => {
    // Move the clock past the entry button's 300 ms throttle between the two presses, so only
    // the navigation guard can block the second one.
    const realNow = Date.now.bind(Date);
    let clockOffset = 0;
    jest.spyOn(Date, 'now').mockImplementation(() => realNow() + clockOffset);
    await renderScreen('en', undefined, 'Home');

    await fireEvent.press(screen.getByText('Premium consultation'));
    // Back before the Consultation screen has finished sliding in.
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() =>
      expect(screen.queryByText('GUM Specialists are here!')).not.toBeOnTheScreen(),
    );
    clockOffset += 1000;
    await fireEvent.press(screen.getByText('Premium consultation'));

    expect(await screen.findByText('GUM Specialists are here!')).toBeOnTheScreen();
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

describe('ConsultationScreen surroundings', () => {
  // SPEC §10: the header, the list end and the bottom section stay visible in every state.
  test.each([
    ['while the Specialists load', pendingRepository, null],
    [
      'when there are no Specialists',
      fakeRepository([]),
      'No Specialists are available right now.',
    ],
  ])('stay visible %s', async (_state, repository, stateText) => {
    await renderScreen('en', repository);
    if (stateText) {
      expect(await screen.findByText(stateText)).toBeOnTheScreen();
    }

    expect(screen.getByText('GUM Specialists are here!')).toBeOnTheScreen();
    expect(screen.getByText(/For general enquiries/)).toBeOnTheScreen();
    expect(screen.getByText(/constitutes your agreement/)).toBeOnTheScreen();
    expect(screen.getByText('Book appointment')).toBeOnTheScreen();
    expect(screen.getByText('WhatsApp us')).toBeOnTheScreen();
  });
});

describe('ConsultationScreen contact info and agreements', () => {
  beforeEach(() => {
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // PRD copy.
  test.each([
    [
      'en',
      /^For general enquiries, please feel free to reach out to us using the method below:/,
      'Your use of our appointment service or communication via WhatsApp constitutes your agreement to our collection and use of personal data as outlined in our privacy policy.',
    ],
    [
      'zh-HK',
      /^如有一般查詢，歡迎致電本公司熱線/,
      '閣下使用本公司之預約服務或透過 WhatsApp 與本公司聯絡，即表示同意本公司根據私隱政策所載條款，收集及使用閣下之個人資料。',
    ],
  ] as const)(
    'shows the contact info and the agreements notice in %s',
    async (language, contactInfo, agreements) => {
      await renderScreen(language);

      expect(await screen.findByText(contactInfo)).toBeOnTheScreen();
      expect(screen.getByText(agreements)).toBeOnTheScreen();
    },
  );

  test.each(['en', 'zh-HK'] as const)(
    'the hotline and email are tappable in %s',
    async (language) => {
      await renderScreen(language);

      await fireEvent.press(await screen.findByText('+852 2893 4402'));
      await fireEvent.press(screen.getByText('memberservice@gumhk.com'));

      expect(Linking.openURL).toHaveBeenCalledWith('tel:+85228934402');
      expect(Linking.openURL).toHaveBeenCalledWith('mailto:memberservice@gumhk.com');
    },
  );
});
