import type { Page, PageParams, Specialist } from './Specialist';
import type { SpecialistRepository } from './SpecialistRepository';

// Stub for the Q2 CMS (ADR-002): same interface, so swapping it in changes one line in the
// provider setup. Not implemented until the CMS exists.
export class CmsSpecialistRepository implements SpecialistRepository {
  getSpecialists(_params: PageParams): Promise<Page<Specialist>> {
    return Promise.reject(
      new Error('CmsSpecialistRepository is not implemented until the Q2 CMS.'),
    );
  }
}
