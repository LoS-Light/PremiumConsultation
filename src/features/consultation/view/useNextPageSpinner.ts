import { useCallback, useEffect, useRef, useState } from 'react';

// If the new rows never make the list taller (every Specialist on the page was a duplicate),
// stop waiting for them after this long.
const WAIT_FOR_ROWS_MS = 500;

// Whether the list end shows the next-page spinner (SPEC §10). It shows while the next page
// loads, and stays until the new rows have made the list taller: the list renders new rows a
// moment after the page arrives, and taking the spinner's space away before then would shorten
// the content and push the scroll position back.
export function useNextPageSpinner({
  isFetchingNextPage,
  hasNextPageFailed,
}: {
  isFetchingNextPage: boolean;
  hasNextPageFailed: boolean;
}) {
  // Last render's isFetchingNextPage, to notice a fetch ending.
  const [isFetchingNextPageBefore, setIsFetchingNextPageBefore] = useState(isFetchingNextPage);
  const [isAwaitingRows, setIsAwaitingRows] = useState(false);
  const lastContentHeight = useRef(0);

  // When a fetch ends, wait for its rows, unless it failed (no rows will come).
  if (isFetchingNextPageBefore !== isFetchingNextPage) {
    setIsFetchingNextPageBefore(isFetchingNextPage);
    setIsAwaitingRows(!isFetchingNextPage && !hasNextPageFailed);
  }

  useEffect(() => {
    if (!isAwaitingRows) {
      return;
    }
    const timeout = setTimeout(() => setIsAwaitingRows(false), WAIT_FOR_ROWS_MS);
    return () => clearTimeout(timeout);
  }, [isAwaitingRows]);

  const handleContentSizeChange = useCallback(
    (_width: number, height: number) => {
      const hasGrown = height > lastContentHeight.current;
      lastContentHeight.current = height;
      if (isAwaitingRows && hasGrown) {
        setIsAwaitingRows(false);
      }
    },
    [isAwaitingRows],
  );

  return { isShown: isFetchingNextPage || isAwaitingRows, handleContentSizeChange };
}
