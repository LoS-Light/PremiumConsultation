import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

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

async function renderButton(onPress: () => void) {
  await render(
    <ThrottledPressable onPress={onPress}>
      <Text>Press me</Text>
    </ThrottledPressable>,
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

  test('a second press within 300 ms is ignored', async () => {
    const onPress = jest.fn();
    const button = await renderButton(onPress);

    await fireEvent.press(button);
    now += 299;
    await fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('a press 300 ms after the last one fires again', async () => {
    const onPress = jest.fn();
    const button = await renderButton(onPress);

    await fireEvent.press(button);
    now += 300;
    await fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(2);
  });
});
