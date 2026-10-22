import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

import { useFeatureFlag } from '../../../shared/featureFlags/FeatureFlagProvider';
import { useComingSoonDialog } from './useComingSoonDialog';

// The Consultation route's own guard (SPEC §7): if the screen is reached while Premium
// consultation is disabled (a deep link, say), show the coming-soon dialog and leave. Returns
// whether the screen may show.
export function useConsultationGate(): boolean {
  const isEnabled = useFeatureFlag('premiumConsultation');
  const navigation = useNavigation();
  const showComingSoon = useComingSoonDialog();

  useEffect(() => {
    if (isEnabled) {
      return;
    }
    showComingSoon();
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Nothing to go back to (the app opened on this screen): start over at Home.
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  }, [isEnabled, navigation, showComingSoon]);

  return isEnabled;
}
