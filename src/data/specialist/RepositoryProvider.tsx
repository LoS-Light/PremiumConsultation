import { createContext, type ReactNode, useContext } from 'react';

import type { SpecialistRepository } from '../../domain/specialist/SpecialistRepository';

const RepositoryContext = createContext<SpecialistRepository | null>(null);

// Provides the Specialist data source at the app root. Swapping the hardcoded list for the
// CMS means passing a different repository here (ADR-002).
export function RepositoryProvider({
  repository,
  children,
}: {
  repository: SpecialistRepository;
  children: ReactNode;
}) {
  return <RepositoryContext.Provider value={repository}>{children}</RepositoryContext.Provider>;
}

export function useSpecialistRepository(): SpecialistRepository {
  const repository = useContext(RepositoryContext);
  if (repository === null) {
    throw new Error('useSpecialistRepository must be used inside a RepositoryProvider.');
  }
  return repository;
}
