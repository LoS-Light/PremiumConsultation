import { FEATURE_FLAG_DEFAULTS } from '../shared/config/featureFlags';
import type { FeatureFlagService } from '../shared/featureFlags/FeatureFlagService';
import { LocalFeatureFlagService } from '../shared/featureFlags/LocalFeatureFlagService';

// The app's feature flags (SPEC §7). Moving to Firebase Remote Config or the CMS means
// replacing this one statement with another FeatureFlagService; App and every screen stay as
// they are.
export const featureFlagService: FeatureFlagService = new LocalFeatureFlagService(
  FEATURE_FLAG_DEFAULTS,
);
