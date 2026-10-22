import { fireEvent, screen } from '@testing-library/react-native';

import { controllableClock, renderApp } from '../../../test/renderApp';

// Each test moves the clock past the press throttle (SPEC §8a) before every press, so only the
// DialogManager decides what shows.
let clock: ReturnType<typeof controllableClock>;

beforeEach(async () => {
  clock = controllableClock();
  await renderApp();
  await fireEvent.press(screen.getByText('Test multiple dialogs'));
  await screen.findByRole('button', { name: 'One dialog' });
});

afterEach(() => {
  jest.restoreAllMocks();
});

async function pressButton(button: ReturnType<typeof screen.getByRole>) {
  clock.passThrottle();
  await fireEvent.press(button);
}

// Buttons by role, so a button and a dialog's text can't be confused.
async function press(label: string) {
  await pressButton(screen.getByRole('button', { name: label }));
}

// The dialogs on screen, by their body text.
function shownDialogs() {
  return screen
    .queryAllByText(/^Test dialog [ABC] \(ID: demo[ABC]\)\.$/)
    .map((element) => (element.props.children as string).charAt('Test dialog '.length));
}

describe('DialogDemoScreen', () => {
  test('shows one dialog when its button is pressed twice quickly', async () => {
    const button = screen.getByRole('button', { name: 'One dialog' });

    // The second press lands before the dialog covers the button.
    await pressButton(button);
    await pressButton(button);
    expect(shownDialogs()).toEqual(['A']);

    await press('OK');
    expect(shownDialogs()).toEqual([]);
  });

  test('shows one dialog when two buttons ask for the same one', async () => {
    await press('Press two buttons, same dialog');
    expect(shownDialogs()).toEqual(['A']);

    await press('OK');
    expect(shownDialogs()).toEqual([]);
  });

  test('shows dialogs asked for at once one after another', async () => {
    await press('Three dialogs at once');
    expect(shownDialogs()).toEqual(['A']);

    await press('OK');
    expect(shownDialogs()).toEqual(['B']);
    await press('OK');
    expect(shownDialogs()).toEqual(['C']);
    await press('OK');
    expect(shownDialogs()).toEqual([]);
  });
});
