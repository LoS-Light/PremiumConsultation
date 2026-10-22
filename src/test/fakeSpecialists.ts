import type { Page, PageParams, Specialist } from '../data/specialist/Specialist';
import type { SpecialistRepository } from '../data/specialist/SpecialistRepository';

// Specialists s1, s2, … in order, for tests that page through a list.
export function numberedSpecialists(count: number): Specialist[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `s${index + 1}`,
    name: `Specialist ${index + 1}`,
  }));
}

// The page of the list a repository returns for these params.
export function pageOf(list: Specialist[], { offset, limit }: PageParams): Page<Specialist> {
  return { items: list.slice(offset, offset + limit), offset, limit, total: list.length };
}

// A repository that answers at once with pages of the given Specialists; its getSpecialists
// is a Jest mock, so tests can check what was asked for.
export function fakeRepository(specialists: Specialist[]) {
  return {
    getSpecialists: jest.fn<Promise<Page<Specialist>>, [PageParams]>(async (params) =>
      pageOf(specialists, params),
    ),
  } satisfies SpecialistRepository;
}
