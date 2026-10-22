import type { FeatureFlag, FeatureFlags, SwitchableFeatureFlagService } from './FeatureFlagService';

// The demo's feature flags: in memory, starting from the given defaults and switched from the
// Feature toggles sheet on Home. Nothing is persisted, so an app restart resets them. A demo
// shortcut, not the production approach (SPEC §7).
export class LocalFeatureFlagService implements SwitchableFeatureFlagService {
  private flags: FeatureFlags;
  private readonly listeners = new Set<() => void>();

  constructor(defaults: FeatureFlags) {
    this.flags = { ...defaults };
  }

  isEnabled(flag: FeatureFlag): boolean {
    return this.flags[flag];
  }

  setEnabled(flag: FeatureFlag, isEnabled: boolean): void {
    this.flags = { ...this.flags, [flag]: isEnabled };
    this.listeners.forEach((listener) => listener());
  }

  subscribe(onChange: () => void): () => void {
    this.listeners.add(onChange);
    return () => this.listeners.delete(onChange);
  }
}
