import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Text } from 'react-native';

import { RepositoryProvider } from '../../../data/specialist/RepositoryProvider';
import type { Specialist } from '../../../data/specialist/Specialist';
import type { SpecialistRepository } from '../../../data/specialist/SpecialistRepository';
import { fakeRepository, numberedSpecialists, pageOf } from '../../../test/fakeSpecialists';
import { useInfiniteSpecialistsQuery } from './useInfiniteSpecialistsQuery';

async function renderInfiniteSpecialists(repository: SpecialistRepository) {
  // A fresh QueryClient per test, with retries off (SPEC §13).
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider repository={repository}>{children}</RepositoryProvider>
    </QueryClientProvider>
  );
  const { result } = await renderHook(() => useInfiniteSpecialistsQuery(), { wrapper });
  return result;
}

describe('useInfiniteSpecialistsQuery', () => {
  test('loads the first page of 10', async () => {
    const repository = fakeRepository(numberedSpecialists(25));

    const result = await renderInfiniteSpecialists(repository);

    await waitFor(() => expect(result.current.specialists).toHaveLength(10));
    expect(result.current.specialists[0]).toEqual({ id: 's1', name: 'Specialist 1' });
    expect(repository.getSpecialists).toHaveBeenCalledWith({ offset: 0, limit: 10 });
    expect(result.current.hasNextPage).toBe(true);
  });

  test('appends the next page when loading more', async () => {
    const repository = fakeRepository(numberedSpecialists(25));
    const result = await renderInfiniteSpecialists(repository);
    await waitFor(() => expect(result.current.specialists).toHaveLength(10));

    await act(() => result.current.loadMore());

    await waitFor(() => expect(result.current.specialists).toHaveLength(20));
    expect(result.current.specialists[10]).toEqual({ id: 's11', name: 'Specialist 11' });
    expect(repository.getSpecialists).toHaveBeenLastCalledWith({ offset: 10, limit: 10 });
  });

  test('does not fetch when there is no next page', async () => {
    const repository = fakeRepository(numberedSpecialists(3));
    const result = await renderInfiniteSpecialists(repository);
    await waitFor(() => expect(result.current.specialists).toHaveLength(3));
    expect(result.current.hasNextPage).toBe(false);

    await act(() => result.current.loadMore());

    expect(repository.getSpecialists).toHaveBeenCalledTimes(1);
  });

  // e.g. onEndReached firing twice while the next page is still on its way
  test('does not fetch the next page twice while it is loading', async () => {
    const repository = fakeRepository(numberedSpecialists(25));
    const result = await renderInfiniteSpecialists(repository);
    await waitFor(() => expect(result.current.specialists).toHaveLength(10));

    await act(async () => {
      void result.current.loadMore();
      await Promise.resolve();
      void result.current.loadMore();
    });

    await waitFor(() => expect(result.current.specialists).toHaveLength(20));
    expect(repository.getSpecialists).toHaveBeenCalledTimes(2);
  });

  // Offset pages can overlap when the source changes between requests (SPEC §6.4).
  test('removes a Specialist repeated across pages', async () => {
    const list = numberedSpecialists(25);
    // A Specialist inserted at the top after the first page shifts the second page back by
    // one, so it starts with the last Specialist of the first page again.
    const repository: SpecialistRepository = {
      getSpecialists: async ({ offset, limit }) => {
        const start = offset === 0 ? 0 : offset - 1;
        return { ...pageOf(list, { offset: start, limit }), offset };
      },
    };
    const result = await renderInfiniteSpecialists(repository);
    await waitFor(() => expect(result.current.specialists).toHaveLength(10));

    await act(() => result.current.loadMore());

    await waitFor(() => expect(result.current.specialists).toHaveLength(19));
    expect(result.current.specialists.map(({ id }) => id)).toEqual(
      list.slice(0, 19).map(({ id }) => id),
    );
  });

  // After a failed next page, only Retry (T-0013) loads it again: onEndReached fires again
  // when the spinner's space goes, and must not refetch the failed page in a loop.
  test('does not load more after the next page failed', async () => {
    const list = numberedSpecialists(25);
    const getSpecialists = jest.fn<
      ReturnType<SpecialistRepository['getSpecialists']>,
      Parameters<SpecialistRepository['getSpecialists']>
    >(async ({ offset, limit }) => {
      if (offset > 0) {
        throw new Error('network down');
      }
      return pageOf(list, { offset, limit });
    });
    const result = await renderInfiniteSpecialists({ getSpecialists });
    await waitFor(() => expect(result.current.specialists).toHaveLength(10));
    await act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.hasNextPageFailed).toBe(true));

    await act(() => result.current.loadMore());

    expect(getSpecialists).toHaveBeenCalledTimes(2);
  });

  // Entering the Consultation screen again while the old one is still animating out: the old
  // one leaving must not take the new one's Specialists away or leave it loading.
  test('keeps a newer screen loaded when an older one goes', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    // Answers once the test releases it, so the first page is still loading as screens change.
    const list = numberedSpecialists(25);
    const held: (() => void)[] = [];
    const repository: SpecialistRepository = {
      getSpecialists: (params) =>
        new Promise((resolve) => held.push(() => resolve(pageOf(list, params)))),
    };
    function Screen({ name }: { name: string }) {
      const { specialists, isLoadingFirstPage } = useInfiniteSpecialistsQuery();
      return <Text>{`${name}: ${isLoadingFirstPage ? 'loading' : specialists.length}`}</Text>;
    }
    function App({ screens }: { screens: string[] }) {
      return (
        <QueryClientProvider client={queryClient}>
          <RepositoryProvider repository={repository}>
            {screens.map((name) => (
              <Screen key={name} name={name} />
            ))}
          </RepositoryProvider>
        </QueryClientProvider>
      );
    }

    const { rerender } = await render(<App screens={['old']} />);
    expect(screen.getByText('old: loading')).toBeOnTheScreen();
    await rerender(<App screens={['old', 'new']} />);
    await rerender(<App screens={['new']} />);
    await act(async () => held.forEach((release) => release()));

    expect(await screen.findByText('new: 10')).toBeOnTheScreen();
  });
});
