import { useCallback } from 'react';

import {
  useFeatureFlag,
  useFeatureFlagService,
} from '../../../shared/featureFlags/FeatureFlagProvider';
import { type FeatureFlag, isSwitchable } from '../../../shared/featureFlags/FeatureFlagService';

// One switch of the Feature toggles sheet (SPEC §4.1). Only a switchable (in-memory) service can
// be switched: with a remote one (the CMS, Firebase Remote Config) the switch would do nothing,
// so the sheet is a demo-only tool.
export function useFeatureToggle(flag: FeatureFlag) {
  const service = useFeatureFlagService();
  const isEnabled = useFeatureFlag(flag);

  const setEnabled = useCallback(
    (isOn: boolean) => {
      if (isSwitchable(service)) {
        service.setEnabled(flag, isOn);
      }
    },
    [service, flag],
  );

  return { isEnabled, setEnabled };
}
