import { render, screen } from '@testing-library/react-native';

import App from './App';

// Smoke test: proves Jest, jest-expo and React Native Testing Library are wired up.
test('renders the placeholder screen', async () => {
  await render(<App />);

  expect(screen.getByText('Premium Consultation')).toBeOnTheScreen();
});
