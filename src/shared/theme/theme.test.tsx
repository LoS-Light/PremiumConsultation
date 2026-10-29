import { act, screen } from '@testing-library/react-native';

import { fakeRepository } from '../../test/fakeSpecialists';
import { renderApp } from '../../test/renderApp';

// The system appearance, as React Native's useColorScheme reports it. Changing it re-renders
// every component that reads it, as switching dark mode on the device does.
let mockScheme: 'light' | 'dark' = 'light';
const mockListeners = new Set<() => void>();

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => {
  const { useSyncExternalStore } = jest.requireActual<typeof import('react')>('react');
  const subscribe = (listener: () => void) => {
    mockListeners.add(listener);
    return () => mockListeners.delete(listener);
  };
  return {
    __esModule: true,
    default: function useColorScheme() {
      return useSyncExternalStore(subscribe, () => mockScheme);
    },
  };
});

function setSystemAppearance(scheme: 'light' | 'dark') {
  mockScheme = scheme;
  mockListeners.forEach((listener) => listener());
}

const EMPTY_MESSAGE = 'No Specialists are available right now.';

async function openEmptyConsultation() {
  await renderApp({ repository: fakeRepository([]), initialRouteName: 'Consultation' });
  return screen.findByText(EMPTY_MESSAGE);
}

afterEach(() => {
  setSystemAppearance('light');
});

describe('theme', () => {
  test('light mode shows the Figma colours', async () => {
    setSystemAppearance('light');

    expect(await openEmptyConsultation()).toHaveStyle({ color: '#A7A7A7' });
    expect(screen.getByRole('button', { name: 'Book appointment' })).toHaveStyle({
      backgroundColor: '#000000',
    });
  });

  test('dark mode shows the dark colours', async () => {
    setSystemAppearance('dark');

    expect(await openEmptyConsultation()).toHaveStyle({ color: '#8E8E93' });
    // Primary buttons turn a muted gold, so they stand out without glaring.
    expect(screen.getByRole('button', { name: 'Book appointment' })).toHaveStyle({
      backgroundColor: '#C9A227',
    });
  });

  test('switching dark mode on recolours the screen that is open', async () => {
    setSystemAppearance('light');
    await openEmptyConsultation();

    await act(async () => setSystemAppearance('dark'));

    expect(screen.getByText(EMPTY_MESSAGE)).toHaveStyle({ color: '#8E8E93' });
  });
});
