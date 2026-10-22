import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { createDialogQueue, type DialogRequest } from './dialogQueue';
import { type DialogContent, DialogView } from './DialogView';

interface DialogManager {
  // Shows the dialog, queues it behind the one on screen, or ignores it if that ID is already
  // showing or queued (SPEC §8).
  show(id: string, content: DialogContent): void;
}

const DialogContext = createContext<DialogManager | null>(null);

// The DialogManager: the queue is the synchronous guard, and the dialog on screen is state.
export function DialogProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<DialogRequest<DialogContent> | null>(null);
  const [queue] = useState(() => createDialogQueue<DialogContent>(setCurrent));
  const manager = useMemo<DialogManager>(
    () => ({ show: (id, content) => queue.show({ id, content }) }),
    [queue],
  );

  return (
    <DialogContext.Provider value={manager}>
      {children}
      <DialogView
        content={current?.content ?? null}
        onClose={() => {
          if (current !== null) {
            queue.close(current.id);
          }
        }}
      />
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogManager {
  const manager = useContext(DialogContext);
  if (manager === null) {
    throw new Error('useDialog must be used inside a DialogProvider.');
  }
  return manager;
}
