import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import { useFeatureFlag } from '../../../shared/featureFlags/FeatureFlagProvider';
import { useComingSoonDialog } from '../../consultation/viewmodel/useComingSoonDialog';

// The Home entry button's action (SPEC §4.1, §7): open the Consultation screen when Premium
// consultation is enabled, otherwise the coming-soon dialog. Neither shows twice on a double
// press: navigate() goes to the screen already in the stack rather than pushing it again, and
// the DialogManager ignores a dialog that is already showing (SPEC §8a).
export function useConsultationEntry() {
  const isEnabled = useFeatureFlag('premiumConsultation');
  const navigation = useNavigation();
  const showComingSoon = useComingSoonDialog();

  return useCallback(() => {
    if (isEnabled) {
      navigation.navigate('Consultation');
    } else {
      showComingSoon();
    }
  }, [isEnabled, navigation, showComingSoon]);
}
