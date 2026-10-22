import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { useSpecialistRepository } from '../../../data/specialist/RepositoryProvider';
import type { Specialist } from '../../../data/specialist/Specialist';
import { SPECIALISTS_PAGE_SIZE } from '../../../shared/config/specialists';

const INFINITE_SPECIALISTS_KEY = ['specialists', 'infinite'];

// Infinite mode (SPEC §6.2): the Specialists page by page, by offset (ADR-007).
export function useInfiniteSpecialists() {
  const repository = useSpecialistRepository();
  const queryClient = useQueryClient();
  const query = useInfiniteQuery({
    queryKey: INFINITE_SPECIALISTS_KEY,
    queryFn: ({ pageParam }) =>
      repository.getSpecialists({ offset: pageParam, limit: SPECIALISTS_PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (last) =>
      last.offset + last.items.length < last.total ? last.offset + last.items.length : undefined,
  });

  // Forget the pages when the screen goes, so entering again starts from the first page rather
  // than reloading every cached page one by one (SPEC §6.2).
  useEffect(
    () => () => queryClient.removeQueries({ queryKey: INFINITE_SPECIALISTS_KEY }),
    [queryClient],
  );

  const pages = query.data?.pages;
  const specialists = useMemo(
    () => uniqueById(pages?.flatMap((page) => page.items) ?? []),
    [pages],
  );

  return {
    specialists,
    // The first page is loading: on entering, or on Retry after it failed.
    isLoadingFirstPage: pages === undefined && query.isFetching,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    // TanStack Query keeps the error while Retry loads the page again; it's no longer failed then.
    hasNextPageFailed: query.isFetchNextPageError && !query.isFetchingNextPage,
    // Retry after the first page failed: load it again.
    retry: () => query.refetch(),
    // Retry after the next page failed: load that page again (unlike loadMore, which leaves a
    // failed page to Retry).
    retryNextPage: () => query.fetchNextPage({ cancelRefetch: false }),
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
