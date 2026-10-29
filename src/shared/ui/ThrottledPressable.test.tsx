import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { FEATURE_FLAG_DEFAULTS } from '../config/featureFlags';
import { FeatureFlagProvider } from '../featureFlags/FeatureFlagProvider';
import { LocalFeatureFlagService } from '../featureFlags/LocalFeatureFlagService';
import { ThrottledPressable } from './ThrottledPressable';

// The throttle reads the clock through Date.now, so the tests set the time directly.
let now = 0;
beforeEach(() => {
  now = 1_000;
  jest.spyOn(Date, 'now').mockImplementation(() => now);
});
afterEach(() => {
  jest.restoreAllMocks();
});

async function renderButton(onPress: () => void, { isThrottleOn = true } = {}) {
  const featureFlagService = new LocalFeatureFlagService({
    ...FEATURE_FLAG_DEFAULTS,
    pressThrottle: isThrottleOn,
  });
  await render(
    <FeatureFlagProvider service={featureFlagService}>
      <ThrottledPressable onPress={onPress}>
        <Text>Press me</Text>
      </ThrottledPressable>
    </FeatureFlagProvider>,
  );
  return screen.getByText('Press me');
}

describe('ThrottledPressable', () => {
  test('the first press fires immediately', async () => {
    const onPress = jest.fn();
    const button = await renderButton(onPress);

    await fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('a second press within 500 ms is ignored', async () => {
    const onPress = jest.fn();
    const button = await renderButton(onPress);

    await fireEvent.press(button);
    now += 499;
    await fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('a press 500 ms after the last one fires again', async () => {
    const onPress = jest.fn();
    const button = await renderButton(onPress);

    await fireEvent.press(button);
    now += 500;
    await fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(2);
  });

  // The Feature toggles sheet can switch the throttle off, to show the other layers alone.
  test('with the press throttle off, a second press within 500 ms fires too', async () => {
    const onPress = jest.fn();
    const button = await renderButton(onPress, { isThrottleOn: false });

    await fireEvent.press(button);
    now += 1;
    await fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(2);
  });
});
