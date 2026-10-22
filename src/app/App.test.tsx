import { render, screen } from '@testing-library/react-native';

import App from './App';

// The real app keeps timers alive (simulated network delay, query cache clean-up), so use
// fake timers: they never keep Jest from exiting.
jest.useFakeTimers();

// Smoke test: the app boots with its providers and navigation and opens on the Home screen.
test('opens on the Home screen', async () => {
  await render(<App />);

  expect(await screen.findByText('Premium consultation')).toBeOnTheScreen();
});
