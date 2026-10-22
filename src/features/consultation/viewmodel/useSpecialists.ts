import { useQuery } from '@tanstack/react-query';

import { useSpecialistRepository } from '../../../data/specialist/RepositoryProvider';

// Plain mode (SPEC §6.1): every Specialist in one request.
export function useSpecialists() {
  const repository = useSpecialistRepository();
  return useQuery({
    queryKey: ['specialists', 'all'],
    queryFn: async () => {
      const page = await repository.getSpecialists({ offset: 0, limit: Number.MAX_SAFE_INTEGER });
      return page.items;
    },
  });
}
