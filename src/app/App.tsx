import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { NotoSansTC_700Bold } from '@expo-google-fonts/noto-sans-tc/700Bold';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConsultationScreen } from '../features/consultation/view/ConsultationScreen';
import { useAppLanguage } from '../shared/i18n/useAppLanguage';

// Keep the splash screen up until the Figma fonts are ready.
void SplashScreen.preventAutoHideAsync();

export default function App() {
  // Weights are imported one by one: the package root would bundle every weight.
  const [areFontsLoaded, fontError] = useFonts({ Inter_500Medium, NotoSansTC_700Bold });

  const i18n = useAppLanguage();
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
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <ConsultationScreen />
      </I18nextProvider>
    </SafeAreaProvider>
  );
}
