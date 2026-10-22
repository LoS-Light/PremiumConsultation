export type FeatureFlag =
  | 'premiumConsultation'
  // Layer 1 of the duplicate-press protection (SPEC §8a); off shows the other layers alone.
  | 'pressThrottle'
  // The DialogManager's two rules (SPEC §8); off shows what each prevents.
  | 'dialogDeduplication'
  | 'dialogQueue';

export type FeatureFlags = Record<FeatureFlag, boolean>;

// Where the app reads its feature flags (SPEC §7). In production this would be Firebase Remote
// Config or the Q2 CMS, with a safe default (off) when the remote value is unavailable; UI and
// hooks don't change.
export interface FeatureFlagService {
  isEnabled(flag: FeatureFlag): boolean;
  // Calls onChange whenever a flag changes; returns a function that stops it.
  subscribe(onChange: () => void): () => void;
}

// A service whose flags can be switched at runtime, like the demo's in-memory one.
export interface SwitchableFeatureFlagService extends FeatureFlagService {
  setEnabled(flag: FeatureFlag, isEnabled: boolean): void;
}

export function isSwitchable(service: FeatureFlagService): service is SwitchableFeatureFlagService {
  return 'setEnabled' in service;
}
