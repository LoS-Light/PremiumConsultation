import { render, screen } from '@testing-library/react-native';

import App from './App';

// The real app keeps timers alive (simulated network delay, query cache clean-up), so use
// fake timers: they never keep Jest from exiting.
jest.useFakeTimers();

// Smoke test: the app boots with its providers and opens on the Consultation screen.
test('opens on the Consultation screen', async () => {
  await render(<App />);

  expect(await screen.findByText('GUM Specialists are here!')).toBeOnTheScreen();
});
