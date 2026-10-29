import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import type { RootStackParamList } from '../../../app/navigation';
import type { Specialist } from '../../../domain/specialist/Specialist';
import type { SpecialistRepository } from '../../../domain/specialist/SpecialistRepository';
import type { AppLanguage } from '../../../shared/i18n/resolveLanguage';
import { FEATURE_FLAG_DEFAULTS } from '../../../shared/config/featureFlags';
import { LocalFeatureFlagService } from '../../../shared/featureFlags/LocalFeatureFlagService';
import {
  fakeRepository,
  numberedSpecialists,
  steerableRepository,
} from '../../../test/fakeSpecialists';
import { controllableClock, renderApp } from '../../../test/renderApp';

const FIGMA_SPECIALISTS: Specialist[] = [
  { id: '1', name: 'Kan Chung' },
  { id: '2', name: 'Alisa Mak' },
  { id: '3', name: 'Justin Liu' },
];

// Renders the app opened on the Consultation screen unless told otherwise.
async function renderScreen(
  language: AppLanguage,
  repository: SpecialistRepository = fakeRepository(FIGMA_SPECIALISTS),
  initialRouteName: keyof RootStackParamList = 'Consultation',
) {
  await renderApp({ language, repository, initialRouteName });
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

  // goBack() doesn't de-duplicate, and the second press can reach the button while its screen
  // is leaving (it depends on timing), so the button ignores a press once the screen isn't
  // focused. Without that, this test failed about one full-suite run in ten.
  test('a double press goes back once, with the press throttle off', async () => {
    const consoleError = jest.spyOn(console, 'error');
    await renderApp({
      repository: fakeRepository(FIGMA_SPECIALISTS),
      featureFlagService: new LocalFeatureFlagService({
        ...FEATURE_FLAG_DEFAULTS,
        pressThrottle: false,
      }),
    });
    await fireEvent.press(screen.getByText('Premium consultation'));
    const backButton = await screen.findByRole('button', { name: 'Back' });

    await fireEvent.press(backButton);
    await fireEvent.press(backButton);

    await waitFor(() =>
      expect(screen.queryByText('GUM Specialists are here!')).not.toBeOnTheScreen(),
    );
    expect(screen.getByText('Premium consultation')).toBeOnTheScreen();
    // React Navigation reports a go back with nothing to go back to as an error.
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

// A repository whose request never finishes, to hold the screen in its loading state.
const pendingRepository: SpecialistRepository = {
  getSpecialists: () => new Promise(() => {}),
};

// SPEC §10's error view copy.
const ERROR_TITLE = 'Oops!';
const ERROR_BODY = 'Something went wrong. Please try again.';

describe('ConsultationScreen entering again', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Without this, the cached pages would all be reloaded one by one on the way back in.
  test('starts again from the first page', async () => {
    // The entry button is pressed twice, so move the clock past its press throttle in between.
    const clock = controllableClock();
    const repository = fakeRepository(numberedSpecialists(25));
    await renderScreen('en', repository, 'Home');
    await fireEvent.press(screen.getByText('Premium consultation'));
    expect(await screen.findAllByTestId('specialist-name')).toHaveLength(10);
    await fireEvent(screen.getByTestId('specialist-list'), 'endReached');
    await waitFor(() => expect(repository.getSpecialists).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByTestId('next-page-spinner')).not.toBeOnTheScreen());
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() =>
      expect(screen.queryByText('GUM Specialists are here!')).not.toBeOnTheScreen(),
    );
    repository.getSpecialists.mockClear();
    clock.passThrottle();

    await fireEvent.press(screen.getByText('Premium consultation'));

    expect(await screen.findAllByTestId('specialist-name')).toHaveLength(10);
    expect(repository.getSpecialists).toHaveBeenCalledTimes(1);
    expect(repository.getSpecialists).toHaveBeenCalledWith({ offset: 0, limit: 10 });
  });
});

describe('ConsultationScreen errors', () => {
  test('shows the error view when the first page fails, and Retry loads it', async () => {
    const { repository, failNext, holdNext, releaseHeld } = steerableRepository(
      numberedSpecialists(25),
    );
    failNext();
    await renderScreen('en', repository);

    expect(await screen.findByText(ERROR_TITLE)).toBeOnTheScreen();
    expect(screen.getByText(ERROR_BODY)).toBeOnTheScreen();
    expect(screen.queryByTestId('specialist-name')).not.toBeOnTheScreen();
    // The icon is decoration: screen readers on both platforms skip its "i".
    expect(screen.queryByText('i')).not.toBeOnTheScreen();

    holdNext();
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));

    // While it loads again, the skeleton replaces the error view.
    expect(await screen.findAllByTestId('specialist-skeleton')).not.toHaveLength(0);
    expect(screen.queryByText(ERROR_TITLE)).not.toBeOnTheScreen();
    await act(async () => releaseHeld());
    expect(await screen.findAllByTestId('specialist-name')).toHaveLength(10);
    expect(screen.queryByText(ERROR_TITLE)).not.toBeOnTheScreen();
  });

  test('shows the error view below the loaded Specialists when the next page fails, and Retry appends it', async () => {
    const { repository, failNext, holdNext, releaseHeld } = steerableRepository(
      numberedSpecialists(25),
    );
    await renderScreen('en', repository);
    expect(await screen.findAllByTestId('specialist-name')).toHaveLength(10);

    failNext();
    await fireEvent(screen.getByTestId('specialist-list'), 'endReached');

    expect(await screen.findByText(ERROR_TITLE)).toBeOnTheScreen();
    expect(screen.getAllByTestId('specialist-name')).toHaveLength(10);
    // The contact info stays below it.
    expect(screen.getByText(/For general enquiries/)).toBeOnTheScreen();

    holdNext();
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));

    // While it loads again, the spinner replaces the error view.
    expect(await screen.findByTestId('next-page-spinner')).toBeOnTheScreen();
    expect(screen.queryByText(ERROR_TITLE)).not.toBeOnTheScreen();
    await act(async () => releaseHeld());
    await waitFor(() => expect(screen.queryByTestId('next-page-spinner')).not.toBeOnTheScreen());
    expect(screen.queryByText(ERROR_TITLE)).not.toBeOnTheScreen();
    expect(repository.getSpecialists).toHaveBeenLastCalledWith({ offset: 10, limit: 10 });
    expect(repository.getSpecialists).toHaveBeenCalledTimes(3);
  });
});

describe('ConsultationScreen infinite list', () => {
  test('loads and shows the first page of 10 Specialists', async () => {
    const repository = fakeRepository(numberedSpecialists(25));
    await renderScreen('en', repository);

    // The list renders 10 rows at first anyway, so check what was asked for too.
    expect(await screen.findAllByTestId('specialist-name')).toHaveLength(10);
    expect(repository.getSpecialists).toHaveBeenCalledTimes(1);
    expect(repository.getSpecialists).toHaveBeenCalledWith({ offset: 0, limit: 10 });
  });

  test('loads the next page with a footer spinner when the end of the list is reached', async () => {
    const { repository, holdNext, releaseHeld } = steerableRepository(numberedSpecialists(25));
    await renderScreen('en', repository);
    expect(await screen.findAllByTestId('specialist-name')).toHaveLength(10);

    holdNext();
    await fireEvent(screen.getByTestId('specialist-list'), 'endReached');

    expect(repository.getSpecialists).toHaveBeenLastCalledWith({ offset: 10, limit: 10 });
    expect(await screen.findByTestId('next-page-spinner')).toBeOnTheScreen();
    await act(async () => releaseHeld());
    // The list virtualizes its rows (only the first 10 render without layout here), so the
    // spinner going away is what shows the page arrived.
    await waitFor(() => expect(screen.queryByTestId('next-page-spinner')).not.toBeOnTheScreen());
  });
});

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

describe('ConsultationScreen feature flag', () => {
  // e.g. a deep link straight to the screen: it can't bypass the flag (SPEC §7).
  test('shows the coming-soon dialog and returns to Home when opened while disabled', async () => {
    await renderApp({
      initialRouteName: 'Consultation',
      featureFlagService: new LocalFeatureFlagService({
        ...FEATURE_FLAG_DEFAULTS,
        premiumConsultation: false,
      }),
    });

    expect(
      await screen.findByText('Premium consultation will be available soon.'),
    ).toBeOnTheScreen();
    expect(await screen.findByRole('button', { name: 'Premium consultation' })).toBeOnTheScreen();
    expect(screen.queryByText('GUM Specialists are here!')).not.toBeOnTheScreen();
  });

  test('shows the coming-soon dialog and goes back to Home when disabled while open', async () => {
    const featureFlagService = new LocalFeatureFlagService({
      ...FEATURE_FLAG_DEFAULTS,
      premiumConsultation: true,
    });
    await renderApp({ featureFlagService });
    await fireEvent.press(screen.getByRole('button', { name: 'Premium consultation' }));
    expect(await screen.findByText('GUM Specialists are here!')).toBeOnTheScreen();

    // e.g. a remote flag turned off mid-session
    await act(() => featureFlagService.setEnabled('premiumConsultation', false));

    expect(
      await screen.findByText('Premium consultation will be available soon.'),
    ).toBeOnTheScreen();
    await waitFor(() =>
      expect(screen.queryByText('GUM Specialists are here!')).not.toBeOnTheScreen(),
    );
  });
});
