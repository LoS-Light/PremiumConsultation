import type { Page, PageParams } from '../pagination';
import type { Specialist } from './Specialist';

// The only way screens and hooks read Specialists (ADR-002). The data layer implements it;
// the app picks the implementation. Items come back in display order; the UI never sorts.
// Offset pagination (ADR-007).
export interface SpecialistRepository {
  getSpecialists(params: PageParams): Promise<Page<Specialist>>;
}
