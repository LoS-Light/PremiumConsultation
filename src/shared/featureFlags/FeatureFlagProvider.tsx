import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useSyncExternalStore,
} from 'react';

import type { FeatureFlag, FeatureFlagService } from './FeatureFlagService';

const FeatureFlagContext = createContext<FeatureFlagService | null>(null);

// Provides the app's feature flags (SPEC §7). Swapping the in-memory flags for Firebase Remote
// Config or the CMS means passing a different service here.
export function FeatureFlagProvider({
  service,
  children,
}: {
  service: FeatureFlagService;
  children: ReactNode;
}) {
  return <FeatureFlagContext.Provider value={service}>{children}</FeatureFlagContext.Provider>;
}

export function useFeatureFlagService(): FeatureFlagService {
  const service = useContext(FeatureFlagContext);
  if (service === null) {
    throw new Error('useFeatureFlagService must be used inside a FeatureFlagProvider.');
  }
  return service;
}

// Whether the flag is on, re-rendering when it changes.
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const service = useFeatureFlagService();
  // Stable callbacks, so React subscribes once rather than on every render.
  const subscribe = useCallback((onChange: () => void) => service.subscribe(onChange), [service]);
  const getIsEnabled = useCallback(() => service.isEnabled(flag), [service, flag]);
  return useSyncExternalStore(subscribe, getIsEnabled);
}
