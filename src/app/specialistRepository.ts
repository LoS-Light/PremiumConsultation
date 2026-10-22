import { HardcodedSpecialistRepository } from '../data/specialist/HardcodedSpecialistRepository';
import type { SpecialistRepository } from '../data/specialist/SpecialistRepository';
import { EXTENDED_SPECIALISTS } from '../data/specialist/specialists.fixture';
import { SPECIALISTS_LATENCY_MS } from '../shared/config/specialists';
import { featureFlagService } from './featureFlagService';

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
