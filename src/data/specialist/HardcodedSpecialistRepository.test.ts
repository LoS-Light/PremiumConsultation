import { HardcodedSpecialistRepository } from './HardcodedSpecialistRepository';
import { BASE_SPECIALISTS } from './specialists.fixture';

const DATASET = [
  { id: 'a', name: 'Specialist A' },
  { id: 'b', name: 'Specialist B' },
  { id: 'c', name: 'Specialist C' },
];

function createRepository() {
  return new HardcodedSpecialistRepository({ specialists: DATASET, latencyMs: 0 });
}

describe('HardcodedSpecialistRepository', () => {
  test('returns the first page from offset 0', async () => {
    const page = await createRepository().getSpecialists({ offset: 0, limit: 2 });

    expect(page).toEqual({
      items: [
        { id: 'a', name: 'Specialist A' },
        { id: 'b', name: 'Specialist B' },
      ],
      offset: 0,
      limit: 2,
      total: 3,
    });
  });

  test('returns the next page by offset', async () => {
    const page = await createRepository().getSpecialists({ offset: 1, limit: 1 });

    expect(page.items).toEqual([{ id: 'b', name: 'Specialist B' }]);
    expect(page.offset).toBe(1);
  });

  test('returns the last page, where offset + items reaches the total', async () => {
    const page = await createRepository().getSpecialists({ offset: 2, limit: 2 });

    expect(page.items).toEqual([{ id: 'c', name: 'Specialist C' }]);
    expect(page.offset + page.items.length).toBe(page.total);
  });

  test('returns no items for an offset beyond the total', async () => {
    const page = await createRepository().getSpecialists({ offset: 5, limit: 2 });

    expect(page.items).toEqual([]);
    expect(page.total).toBe(3);
  });

  test('keeps the base Specialists in their Figma order', async () => {
    const repository = new HardcodedSpecialistRepository({
      specialists: BASE_SPECIALISTS,
      latencyMs: 0,
    });

    const page = await repository.getSpecialists({ offset: 0, limit: 10 });

    expect(page.items.map((specialist) => specialist.name)).toEqual([
      'Kan Chung',
      'Alisa Mak',
      'Justin Liu',
    ]);
  });
});
