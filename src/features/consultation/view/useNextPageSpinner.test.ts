import { act, renderHook } from '@testing-library/react-native';

import { useNextPageSpinner } from './useNextPageSpinner';

interface Props {
  isFetchingNextPage: boolean;
  hasNextPageFailed: boolean;
}

// The hook with the list at 1000 pt tall, the next page loading.
async function renderLoadingPage() {
  const hook = await renderHook((props: Props) => useNextPageSpinner(props), {
    initialProps: { isFetchingNextPage: true, hasNextPageFailed: false },
  });
  await act(() => hook.result.current.handleContentSizeChange(390, 1000));
  return hook;
}

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('useNextPageSpinner', () => {
  test('shows while the next page loads', async () => {
    const { result } = await renderLoadingPage();

    expect(result.current.isShown).toBe(true);
  });

  // The rows render a moment after the page arrives; until then, the spinner keeps its space.
  test('stays after the page arrives until the new rows make the list taller', async () => {
    const { result, rerender } = await renderLoadingPage();

    await rerender({ isFetchingNextPage: false, hasNextPageFailed: false });
    expect(result.current.isShown).toBe(true);

    await act(() => result.current.handleContentSizeChange(390, 2000));
    expect(result.current.isShown).toBe(false);
  });

  test('goes 0.5 s after the page arrives if the list never gets taller', async () => {
    const { result, rerender } = await renderLoadingPage();

    await rerender({ isFetchingNextPage: false, hasNextPageFailed: false });
    await act(() => jest.advanceTimersByTime(499));
    expect(result.current.isShown).toBe(true);

    await act(() => jest.advanceTimersByTime(1));
    expect(result.current.isShown).toBe(false);
  });

  // No rows will come, so there is nothing to wait for.
  test('goes at once when the next page fails', async () => {
    const { result, rerender } = await renderLoadingPage();

    await rerender({ isFetchingNextPage: false, hasNextPageFailed: true });

    expect(result.current.isShown).toBe(false);
  });
});
