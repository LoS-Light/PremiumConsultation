import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { i18n as I18n } from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { SpecialistRepository } from '../domain/specialist/SpecialistRepository';
import { RepositoryProvider } from '../data/specialist/RepositoryProvider';
import { DialogProvider } from '../shared/dialog/DialogProvider';
import { FeatureFlagProvider } from '../shared/featureFlags/FeatureFlagProvider';
import type { FeatureFlagService } from '../shared/featureFlags/FeatureFlagService';
import { useTheme } from '../shared/theme';

// Every provider the app runs under, in one place, so App and the tests (src/test/renderApp)
// wrap the navigator the same way. The gesture handler root is needed by the bottom sheets.
export function AppProviders({
  queryClient,
  repository,
  i18n,
  featureFlagService,
  children,
}: {
  queryClient: QueryClient;
  repository: SpecialistRepository;
  i18n: I18n;
  featureFlagService: FeatureFlagService;
  children: ReactNode;
}) {
  // The navigator's own colours (behind a screen while it slides) follow light or dark mode.
  const navigationTheme = useTheme().scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RepositoryProvider repository={repository}>
            <I18nextProvider i18n={i18n}>
              <FeatureFlagProvider service={featureFlagService}>
                <BottomSheetModalProvider>
                  <DialogProvider>
                    <NavigationContainer theme={navigationTheme}>{children}</NavigationContainer>
                  </DialogProvider>
                </BottomSheetModalProvider>
              </FeatureFlagProvider>
            </I18nextProvider>
          </RepositoryProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
