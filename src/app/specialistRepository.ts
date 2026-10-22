import { HardcodedSpecialistRepository } from '../data/specialist/HardcodedSpecialistRepository';
import type { SpecialistRepository } from '../data/specialist/SpecialistRepository';
import { BASE_SPECIALISTS } from '../data/specialist/specialists.fixture';
import { SPECIALISTS_LATENCY_MS } from '../shared/config/specialists';

// The app's Specialist data source (ADR-002). Swapping to the Q2 CMS means replacing this one
// statement with `new CmsSpecialistRepository()`; App and every screen stay as they are.
export const specialistRepository: SpecialistRepository = new HardcodedSpecialistRepository({
  specialists: BASE_SPECIALISTS,
  latencyMs: SPECIALISTS_LATENCY_MS,
});
