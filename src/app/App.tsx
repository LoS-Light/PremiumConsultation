import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { NotoSansTC_700Bold } from '@expo-google-fonts/noto-sans-tc/700Bold';
import { QueryClient } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { useAppLanguage } from '../shared/i18n/useAppLanguage';
import { AppProviders } from './AppProviders';
import { featureFlagService } from './featureFlagService';
import { RootNavigator } from './navigation';
import { specialistRepository } from './specialistRepository';

// Keep the splash screen up until the Figma fonts are ready.
void SplashScreen.preventAutoHideAsync();

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // TEMPORARY: automatic retries are off while the data is hardcoded, so a failure reaches
        // the screen at once instead of after several silent retries (SPEC §6; the error view
        // arrives in v1.1.0). Restore retries when the app calls a real API.
        retry: false,
      },
    },
  });
}

export default function App() {
  // Weights are imported one by one: the package root would bundle every weight.
  const [areFontsLoaded, fontError] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    NotoSansTC_700Bold,
  });

  const i18n = useAppLanguage();
  const [queryClient] = useState(createQueryClient);
  const isReady = areFontsLoaded || fontError !== null;

  useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <AppProviders
      queryClient={queryClient}
      repository={specialistRepository}
      i18n={i18n}
      featureFlagService={featureFlagService}
    >
      <RootNavigator />
    </AppProviders>
  );
}
