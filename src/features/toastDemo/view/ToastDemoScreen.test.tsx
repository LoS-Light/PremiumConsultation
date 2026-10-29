import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { FEATURE_FLAG_DEFAULTS } from '../../../shared/config/featureFlags';
import { LocalFeatureFlagService } from '../../../shared/featureFlags/LocalFeatureFlagService';
import { renderApp } from '../../../test/renderApp';

// Every press shows a toast; only the press throttle (SPEC §8a, layer 1) stops a quick second
// press. The two presses below land within the same few milliseconds.
async function pressToastATwice({ isThrottleOn }: { isThrottleOn: boolean }) {
  await renderApp({
    featureFlagService: new LocalFeatureFlagService({
      ...FEATURE_FLAG_DEFAULTS,
      pressThrottle: isThrottleOn,
    }),
  });
  await fireEvent.press(screen.getByRole('button', { name: 'Test toasts' }));
  const button = await screen.findByRole('button', { name: 'Toast A' });

  await fireEvent.press(button);
  await fireEvent.press(button);
}

describe('ToastDemoScreen', () => {
  test('shows one toast for a quick double press with the press throttle on', async () => {
    await pressToastATwice({ isThrottleOn: true });

    expect(screen.getAllByText(/^Toast A \(press \d+\)$/)).toHaveLength(1);
  });

  test('shows a toast for every press with the press throttle off', async () => {
    await pressToastATwice({ isThrottleOn: false });

    expect(screen.getByText('Toast A (press 1)')).toBeOnTheScreen();
    expect(screen.getByText('Toast A (press 2)')).toBeOnTheScreen();
  });

  // Each toast lives 2.4 s (fade in, 2 s, fade out) from its own press, whatever comes after it.
  test('fades each toast out on its own schedule, even while new ones arrive', async () => {
    await renderApp();
    await fireEvent.press(screen.getByRole('button', { name: 'Test toasts' }));
    const button = await screen.findByRole('button', { name: 'Toast A' });

    await fireEvent.press(button);
    await act(() => new Promise((resolve) => setTimeout(resolve, 1200)));
    await fireEvent.press(button);
    expect(screen.getByText('Toast A (press 1)')).toBeOnTheScreen();

    await waitFor(() => expect(screen.queryByText('Toast A (press 1)')).not.toBeOnTheScreen(), {
      timeout: 1600,
    });
    expect(screen.getByText('Toast A (press 2)')).toBeOnTheScreen();
  }, 10_000);
});
