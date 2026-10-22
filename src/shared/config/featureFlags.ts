import type { FeatureFlags } from '../featureFlags/FeatureFlagService';

// Defaults for the demo's in-memory flags (SPEC §4.1, §7). Premium consultation starts on so
// the entry button works straight away; switch it off on Home to demo the coming-soon dialog.
export const FEATURE_FLAG_DEFAULTS: FeatureFlags = {
  premiumConsultation: true,
  // The press throttle starts on; switch it off to show that navigate() and the DialogManager
  // stop a double press on their own.
  pressThrottle: true,
};
