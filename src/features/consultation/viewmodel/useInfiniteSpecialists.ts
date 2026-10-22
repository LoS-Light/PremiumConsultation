import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useSpecialistRepository } from '../../../data/specialist/RepositoryProvider';
import type { Specialist } from '../../../data/specialist/Specialist';
import { SPECIALISTS_PAGE_SIZE } from '../../../shared/config/specialists';

// Infinite mode (SPEC §6.2): the Specialists page by page, by offset (ADR-007).
export function useInfiniteSpecialists() {
  const repository = useSpecialistRepository();
  const query = useInfiniteQuery({
    queryKey: ['specialists', 'infinite'],
    queryFn: ({ pageParam }) =>
      repository.getSpecialists({ offset: pageParam, limit: SPECIALISTS_PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (last) =>
      last.offset + last.items.length < last.total ? last.offset + last.items.length : undefined,
  });

  const pages = query.data?.pages;
  const specialists = useMemo(
    () => uniqueById(pages?.flatMap((page) => page.items) ?? []),
    [pages],
  );

  return {
    specialists,
    isPending: query.isPending,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPageFailed: query.isFetchNextPageError,
    // Called by onEndReached, which can fire again before the next page arrives. Only fetch
    // when there is a next page, it isn't loading and it didn't just fail (onEndReached fires
    // again when the spinner's space goes, and only Retry should load a failed page again).
    // cancelRefetch: false also makes a call in the same tick (before isFetchingNextPage
    // updates) join the request in flight.
    loadMore: async () => {
      if (query.hasNextPage && !query.isFetchingNextPage && !query.isFetchNextPageError) {
        await query.fetchNextPage({ cancelRefetch: false });
      }
    },
  };
}

// Offset pages can overlap when the source changes between requests (an insert shifts the next
// page back), so keep the first of each ID (SPEC §6.4).
function uniqueById(specialists: Specialist[]): Specialist[] {
  const seen = new Set<string>();
  return specialists.filter(({ id }) => {
    if (seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
}
