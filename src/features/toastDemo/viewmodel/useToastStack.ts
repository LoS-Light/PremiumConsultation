import { useCallback, useRef, useState } from 'react';

export type ToastName = 'A' | 'B' | 'C';

export interface Toast {
  key: number;
  name: ToastName;
  // The how-manieth toast this is, so a demo shows how many presses got through.
  count: number;
}

// The Toast demo's toasts (SPEC §4.1): every call adds one at once, with no queue and no
// de-duplication, so only the press throttle (SPEC §8a, layer 1) stops a quick second press.
export function useToastStack() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const shownCount = useRef(0);

  const show = useCallback((name: ToastName) => {
    shownCount.current += 1;
    const count = shownCount.current;
    setToasts((current) => [...current, { key: count, name, count }]);
  }, []);

  const remove = useCallback((key: number) => {
    setToasts((current) => current.filter((toast) => toast.key !== key));
  }, []);

  return { toasts, show, remove };
}
