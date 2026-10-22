import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { type RootStackParamList, RootNavigator } from '../app/navigation';
import type { Specialist } from '../data/specialist/Specialist';
import type { SpecialistRepository } from '../data/specialist/SpecialistRepository';
import { RepositoryProvider } from '../data/specialist/RepositoryProvider';
import { DialogProvider } from '../shared/dialog/DialogProvider';
import { createI18n } from '../shared/i18n/createI18n';
import type { AppLanguage } from '../shared/i18n/resolveLanguage';

// A fake repository that answers at once with the given Specialists.
export function fakeRepository(specialists: Specialist[]): SpecialistRepository {
  return {
    getSpecialists: async ({ offset, limit }) => ({
      items: specialists.slice(offset, offset + limit),
      offset,
      limit,
      total: specialists.length,
    }),
  };
}

// Renders the app's providers and navigator, as App does, opened on the given screen.
export async function renderApp({
  language = 'en',
  repository = fakeRepository([]),
  initialRouteName = 'Home',
}: {
  language?: AppLanguage;
  repository?: SpecialistRepository;
  initialRouteName?: keyof RootStackParamList;
} = {}) {
  // A fresh QueryClient per test, with retries off (SPEC §13). gcTime: Infinity stops the
  // cache from scheduling a clean-up timer that would keep Jest from exiting.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  await render(
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider repository={repository}>
          <I18nextProvider i18n={createI18n(language)}>
            <DialogProvider>
              <NavigationContainer>
                <RootNavigator initialRouteName={initialRouteName} />
              </NavigationContainer>
            </DialogProvider>
          </I18nextProvider>
        </RepositoryProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>,
  );
}

// Lets a test move the clock past the 300 ms press throttle (SPEC §8a), so a second press on
// the same button reaches the code under test. Restore with jest.restoreAllMocks().
export function controllableClock() {
  const realNow = Date.now.bind(Date);
  let offset = 0;
  jest.spyOn(Date, 'now').mockImplementation(() => realNow() + offset);
  return {
    passThrottle() {
      offset += 1000;
    },
  };
}
