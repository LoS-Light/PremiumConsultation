import type { Page, PageParams, Specialist } from './Specialist';

// The only way screens and hooks read Specialists (ADR-002). Items come back in display
// order; the UI never sorts. Offset pagination (ADR-007).
export interface SpecialistRepository {
  getSpecialists(params: PageParams): Promise<Page<Specialist>>;
}
