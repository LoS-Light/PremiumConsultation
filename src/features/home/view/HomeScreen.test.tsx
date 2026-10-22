import { fireEvent, screen } from '@testing-library/react-native';

import { FEATURE_FLAG_DEFAULTS } from '../../../shared/config/featureFlags';
import { LocalFeatureFlagService } from '../../../shared/featureFlags/LocalFeatureFlagService';
import { controllableClock, renderApp } from '../../../test/renderApp';

const COMING_SOON_BODY = 'Premium consultation will be available soon.'; // SPEC §8

function featureFlagServiceWith({
  isPremiumConsultationEnabled,
}: {
  isPremiumConsultationEnabled: boolean;
}) {
  return new LocalFeatureFlagService({
    ...FEATURE_FLAG_DEFAULTS,
    premiumConsultation: isPremiumConsultationEnabled,
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('HomeScreen entry button', () => {
  test('opens the Consultation screen when Premium consultation is enabled', async () => {
    await renderApp({
      featureFlagService: featureFlagServiceWith({ isPremiumConsultationEnabled: true }),
    });

    await fireEvent.press(screen.getByRole('button', { name: 'Premium consultation' }));

    expect(await screen.findByText('GUM Specialists are here!')).toBeOnTheScreen();
    expect(screen.queryByText(COMING_SOON_BODY)).not.toBeOnTheScreen();
  });

  test('shows the coming-soon dialog when Premium consultation is disabled', async () => {
    await renderApp({
      featureFlagService: featureFlagServiceWith({ isPremiumConsultationEnabled: false }),
    });

    await fireEvent.press(screen.getByRole('button', { name: 'Premium consultation' }));

    expect(screen.getByText('Coming soon')).toBeOnTheScreen();
    expect(screen.getByText(COMING_SOON_BODY)).toBeOnTheScreen();
    expect(screen.queryByText('GUM Specialists are here!')).not.toBeOnTheScreen();
  });

  // The brief: pressing the button twice quickly must not open the dialog twice. The clock
  // moves past the button's 300 ms throttle between the presses, so the second press reaches
  // the DialogManager and only its guard can stop the second dialog (SPEC §8).
  test('opens the coming-soon dialog once when pressed twice quickly', async () => {
    const clock = controllableClock();
    await renderApp({
      featureFlagService: featureFlagServiceWith({ isPremiumConsultationEnabled: false }),
    });
    const entryButton = screen.getByRole('button', { name: 'Premium consultation' });

    await fireEvent.press(entryButton);
    clock.passThrottle();
    await fireEvent.press(entryButton);
    expect(screen.getAllByText(COMING_SOON_BODY)).toHaveLength(1);

    // A duplicate would wait in the queue, so it would show once this one closes.
    clock.passThrottle();
    await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
    expect(screen.queryByText(COMING_SOON_BODY)).not.toBeOnTheScreen();
  });
});

describe('HomeScreen feature toggles', () => {
  test('switching Premium consultation off makes the entry button show the coming-soon dialog', async () => {
    await renderApp({
      featureFlagService: featureFlagServiceWith({ isPremiumConsultationEnabled: true }),
    });

    await fireEvent.press(screen.getByRole('button', { name: 'Feature Toggle' }));
    const toggle = screen.getByRole('switch', { name: 'Enable Premium consultation' });
    expect(toggle).toBeChecked();
    await fireEvent.press(toggle);
    expect(toggle).not.toBeChecked();
    await fireEvent.press(screen.getByRole('button', { name: 'Premium consultation' }));

    expect(screen.getByText(COMING_SOON_BODY)).toBeOnTheScreen();
  });
});

describe('HomeScreen press throttle toggle', () => {
  test('switches the press throttle off from the Feature toggles sheet', async () => {
    const service = featureFlagServiceWith({ isPremiumConsultationEnabled: true });
    await renderApp({ featureFlagService: service });

    await fireEvent.press(screen.getByRole('button', { name: 'Feature Toggle' }));
    const toggle = screen.getByRole('switch', { name: 'Enable press throttle' });
    expect(toggle).toBeChecked();
    await fireEvent.press(toggle);

    expect(toggle).not.toBeChecked();
    expect(service.isEnabled('pressThrottle')).toBe(false);
  });
});

// With the press throttle off, every press runs: the other layers stop the duplicate alone
// (SPEC §8a).
describe('HomeScreen with the press throttle off', () => {
  test('a double press still opens the Consultation screen once', async () => {
    await renderApp({
      featureFlagService: new LocalFeatureFlagService({
        ...FEATURE_FLAG_DEFAULTS,
        pressThrottle: false,
      }),
    });
    const entryButton = screen.getByRole('button', { name: 'Premium consultation' });

    await fireEvent.press(entryButton);
    await fireEvent.press(entryButton);

    // navigate() goes to the screen already in the stack rather than pushing a second one.
    expect(await screen.findAllByText('GUM Specialists are here!')).toHaveLength(1);
  });
});
