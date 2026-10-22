import type { Page, PageParams, Specialist } from './Specialist';
import type { SpecialistRepository } from './SpecialistRepository';

interface Options {
  specialists: readonly Specialist[];
  latencyMs: number;
}

// Current implementation (PRD: "Hardcode for now"): pages over a local dataset after a
// simulated network delay, so the loading state is visible.
export class HardcodedSpecialistRepository implements SpecialistRepository {
  constructor(private readonly options: Options) {}

  async getSpecialists({ offset, limit }: PageParams): Promise<Page<Specialist>> {
    const { specialists, latencyMs } = this.options;
    if (latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, latencyMs));
    }
    return {
      items: specialists.slice(offset, offset + limit),
      offset,
      limit,
      total: specialists.length,
    };
  }
}
