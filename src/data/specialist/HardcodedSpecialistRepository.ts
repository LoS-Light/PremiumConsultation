import { SIMULATED_FAILURE_RATE } from '../../shared/config/specialists';
import type { Page, PageParams, Specialist } from './Specialist';
import type { SpecialistRepository } from './SpecialistRepository';

// Makes requests fail at random for the demo (SPEC §10), so the error view and Retry can be
// shown. The random source is injected: Math.random in the app, fixed values in tests.
export interface FailureSimulation {
  isOn: () => boolean;
  random: () => number;
}

interface Options {
  specialists: readonly Specialist[];
  latencyMs: number;
  failureSimulation?: FailureSimulation;
}

// Current implementation (PRD: "Hardcode for now"): pages over a local dataset after a
// simulated network delay, so the loading state is visible.
export class HardcodedSpecialistRepository implements SpecialistRepository {
  constructor(private readonly options: Options) {}

  async getSpecialists({ offset, limit }: PageParams): Promise<Page<Specialist>> {
    const { specialists, latencyMs, failureSimulation } = this.options;
    if (latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, latencyMs));
    }
    if (failureSimulation?.isOn() && failureSimulation.random() < SIMULATED_FAILURE_RATE) {
      throw new Error('Simulated loading failure');
    }
    return {
      items: specialists.slice(offset, offset + limit),
      offset,
      limit,
      total: specialists.length,
    };
  }
}
