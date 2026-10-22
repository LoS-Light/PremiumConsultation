import type { Specialist } from './Specialist';

// The three Specialists from Figma, in display order (SPEC §5.3). No photos yet, so the
// card shows its placeholder.
export const BASE_SPECIALISTS: readonly Specialist[] = [
  { id: 'specialist-001', name: 'Kan Chung' },
  { id: 'specialist-002', name: 'Alisa Mak' },
  { id: 'specialist-003', name: 'Justin Liu' },
];

// Names for the generated Specialists: each of the 10 first names meets each of the 10 last
// names once, which makes the 100 distinct names.
const FIRST_NAMES = [
  'Amy',
  'Ben',
  'Chloe',
  'David',
  'Emma',
  'Felix',
  'Grace',
  'Henry',
  'Ivy',
  'Jason',
];
const LAST_NAMES = ['Chan', 'Cheung', 'Ho', 'Lam', 'Lau', 'Lee', 'Leung', 'Ng', 'Wong', 'Yip'];

// The nth generated Specialist (from 0): the first names cycle within each last name.
function generatedSpecialist(n: number): Specialist {
  const number = BASE_SPECIALISTS.length + n + 1;
  const firstName = FIRST_NAMES[n % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.floor(n / FIRST_NAMES.length)];
  return { id: `specialist-${String(number).padStart(3, '0')}`, name: `${firstName} ${lastName}` };
}

// v1.1.0's 103 Specialists (SPEC §5.3): the base three, then 100 generated ones with IDs
// specialist-004 to specialist-103 and no photos. Deterministic, so tests are reproducible.
export const EXTENDED_SPECIALISTS: readonly Specialist[] = [
  ...BASE_SPECIALISTS,
  ...Array.from({ length: FIRST_NAMES.length * LAST_NAMES.length }, (_, n) =>
    generatedSpecialist(n),
  ),
];
