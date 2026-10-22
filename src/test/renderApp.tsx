import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';

import { AppProviders } from '../app/AppProviders';
import { type RootStackParamList, RootNavigator } from '../app/navigation';
import type { Specialist } from '../data/specialist/Specialist';
import type { SpecialistRepository } from '../data/specialist/SpecialistRepository';
import { FEATURE_FLAG_DEFAULTS } from '../shared/config/featureFlags';
import type { FeatureFlagService } from '../shared/featureFlags/FeatureFlagService';
import { LocalFeatureFlagService } from '../shared/featureFlags/LocalFeatureFlagService';
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
  featureFlagService = new LocalFeatureFlagService(FEATURE_FLAG_DEFAULTS),
}: {
  language?: AppLanguage;
  repository?: SpecialistRepository;
  initialRouteName?: keyof RootStackParamList;
  featureFlagService?: FeatureFlagService;
} = {}) {
  // A fresh QueryClient per test, with retries off (SPEC §13). gcTime: Infinity stops the
  // cache from scheduling a clean-up timer that would keep Jest from exiting.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  await render(
    <AppProviders
      queryClient={queryClient}
      repository={repository}
      i18n={createI18n(language)}
      featureFlagService={featureFlagService}
    >
      <RootNavigator initialRouteName={initialRouteName} />
    </AppProviders>,
  );
}

// Lets a test move the clock past the 500 ms press throttle (SPEC §8a), so a second press on
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
