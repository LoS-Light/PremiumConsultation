import { HardcodedSpecialistRepository } from '../data/specialist/HardcodedSpecialistRepository';
import { EXTENDED_SPECIALISTS } from '../data/specialist/hardcodedSpecialists';
import type { SpecialistRepository } from '../domain/specialist/SpecialistRepository';
import { FEATURE_FLAG_DEFAULTS } from '../shared/config/featureFlags';
import { SPECIALISTS_LATENCY_MS } from '../shared/config/specialists';
import type { FeatureFlagService } from '../shared/featureFlags/FeatureFlagService';
import { LocalFeatureFlagService } from '../shared/featureFlags/LocalFeatureFlagService';

// The app's services: the only place a concrete implementation is picked. App hands them to
// AppProviders; screens and hooks see only the interfaces.

// The app's feature flags (SPEC §7). Moving to Firebase Remote Config or the CMS means
// replacing this one statement with another FeatureFlagService; App and every screen stay as
// they are.
export const featureFlagService: FeatureFlagService = new LocalFeatureFlagService(
  FEATURE_FLAG_DEFAULTS,
);

// The app's Specialist data source (ADR-002). Swapping to the Q2 CMS means replacing this one
// statement with `new CmsSpecialistRepository()`; App and every screen stay as they are.
export const specialistRepository: SpecialistRepository = new HardcodedSpecialistRepository({
  // 103 Specialists, paged in by the Consultation screen (SPEC §5.3, §6.2).
  specialists: EXTENDED_SPECIALISTS,
  latencyMs: SPECIALISTS_LATENCY_MS,
  // The Feature toggles' "Simulate loading failure" switch makes requests fail at random.
  failureSimulation: {
    isOn: () => featureFlagService.isEnabled('simulateLoadingFailure'),
    random: Math.random,
  },
});
