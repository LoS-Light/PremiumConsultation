import type { Page, PageParams } from '../domain/pagination';
import type { Specialist } from '../domain/specialist/Specialist';
import type { SpecialistRepository } from '../domain/specialist/SpecialistRepository';

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

// A repository whose requests the test steers one by one: each answers at once, unless the
// test has asked for the next requests to fail (failNext) or to wait until it releases them
// (holdNext, releaseHeld). For error, Retry and loading states.
export function steerableRepository(specialists: Specialist[]) {
  const plan: ('fail' | 'hold')[] = [];
  const held: (() => void)[] = [];
  const repository = {
    getSpecialists: jest.fn<Promise<Page<Specialist>>, [PageParams]>(async (params) => {
      const step = plan.shift();
      if (step === 'fail') {
        throw new Error('network down');
      }
      if (step === 'hold') {
        await new Promise<void>((resolve) => held.push(resolve));
      }
      return pageOf(specialists, params);
    }),
  } satisfies SpecialistRepository;

  return {
    repository,
    failNext: () => plan.push('fail'),
    holdNext: () => plan.push('hold'),
    releaseHeld: () => held.shift()?.(),
  };
}
