import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { useFeatureFlagService } from '../featureFlags/FeatureFlagProvider';
import { createDialogQueue, type DialogRequest } from './dialogQueue';
import { type DialogContent, DialogView } from './DialogView';

interface DialogManager {
  // Shows the dialog, queues it behind the one on screen, or ignores it if that ID is already
  // showing or queued (SPEC §8; each rule can be switched off for the demo).
  show(id: string, content: DialogContent): void;
}

const DialogContext = createContext<DialogManager | null>(null);

// The DialogManager: the queue is the synchronous guard, and the dialogs on screen are state.
// Its two rules follow the dialogDeduplication and dialogQueue flags, on in the app and
// switched off from the Feature toggles sheet for the demo (SPEC §8).
export function DialogProvider({ children }: { children: ReactNode }) {
  const featureFlagService = useFeatureFlagService();
  const [visible, setVisible] = useState<DialogRequest<DialogContent>[]>([]);
  // The queue reads the flags whenever a request arrives, so it always uses the current ones.
  const [queue] = useState(() =>
    createDialogQueue<DialogContent>(setVisible, () => ({
      isDeduplicationOn: featureFlagService.isEnabled('dialogDeduplication'),
      isQueueOn: featureFlagService.isEnabled('dialogQueue'),
    })),
  );
  // A flag switched while dialogs are showing or waiting changes which are on screen.
  useEffect(() => featureFlagService.subscribe(() => queue.refresh()), [featureFlagService, queue]);
  const manager = useMemo<DialogManager>(
    () => ({ show: (id, content) => queue.show({ id, content }) }),
    [queue],
  );

  return (
    <DialogContext.Provider value={manager}>
      {children}
      <DialogView dialogs={visible} onClose={(key) => queue.close(key)} />
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
