export interface DialogRequest<Content> {
  id: string;
  content: Content;
  // Unique per request, given by the queue: tells apart two requests with the same ID (with
  // de-duplication off), so closing one never closes the other.
  key: number;
}

// The DialogManager's two rules (SPEC §8), both on in the app. The Feature toggles sheet can
// switch each off to demo what it prevents.
export interface DialogQueuePolicy {
  // A request for an ID that is already showing or queued is ignored.
  isDeduplicationOn: boolean;
  // One dialog shows at a time; the others wait their turn. Off, they stack at once.
  isQueueOn: boolean;
}

// The DialogManager's guard (SPEC §8, §8a layer 3). The requests live in a plain array that
// is read and written synchronously, so two requests in the same tick both see the first
// one; the UI only renders what onChange reports, oldest first (the last is on top).
export function createDialogQueue<Content>(
  onChange: (visible: DialogRequest<Content>[]) => void,
  getPolicy: () => DialogQueuePolicy,
) {
  // With the queue on, the first request is the dialog on screen and the rest wait; with it
  // off, every request is on screen.
  const requests: DialogRequest<Content>[] = [];
  let lastKey = 0;

  const visibleRequests = () => (getPolicy().isQueueOn ? requests.slice(0, 1) : [...requests]);

  return {
    show({ id, content }: Omit<DialogRequest<Content>, 'key'>) {
      const { isDeduplicationOn, isQueueOn } = getPolicy();
      if (isDeduplicationOn && requests.some((request) => request.id === id)) {
        return;
      }
      lastKey += 1;
      requests.push({ id, content, key: lastKey });
      if (!isQueueOn || requests.length === 1) {
        onChange(visibleRequests());
      }
    },
    // Closes the dialog with this key if it is the one on top, and shows the next one, if any.
    // A second close of the same dialog (the Android back button and its button together, or
    // its button pressed twice) finds another dialog on top and leaves it alone, so no dialog
    // is lost.
    close(key: number) {
      const visible = visibleRequests();
      if (visible[visible.length - 1]?.key !== key) {
        return;
      }
      // The closed dialog leaves the queue, so its ID can be requested again.
      requests.splice(
        requests.findIndex((request) => request.key === key),
        1,
      );
      onChange(visibleRequests());
    },
    // Reports what is on screen again, after the policy changed (a flag switched at runtime),
    // so the UI and the queue agree on which dialog is on top.
    refresh() {
      onChange(visibleRequests());
    },
  };
}
