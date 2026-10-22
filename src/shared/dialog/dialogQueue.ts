export interface DialogRequest<Content> {
  id: string;
  content: Content;
}

// The DialogManager's guard (SPEC §8, §8a layer 3). The requests live in a plain array that
// is read and written synchronously, so two requests in the same tick both see the first
// one; the UI only renders what onChange reports.
export function createDialogQueue<Content>(
  onChange: (current: DialogRequest<Content> | null) => void,
) {
  // The first request is the dialog on screen; the rest wait their turn.
  const requests: DialogRequest<Content>[] = [];

  return {
    show(request: DialogRequest<Content>) {
      if (requests.some(({ id }) => id === request.id)) {
        return;
      }
      requests.push(request);
      if (requests.length === 1) {
        onChange(request);
      }
    },
    // Closes the dialog with this ID if it is the one on screen, and shows the next one, if
    // any. A second close of the same dialog (say the Android back button and its button
    // together) finds another dialog on screen and leaves it alone, so no dialog is lost.
    close(id: string) {
      if (requests[0]?.id !== id) {
        return;
      }
      // The closed dialog leaves the queue, so its ID can be requested again.
      requests.shift();
      onChange(requests[0] ?? null);
    },
  };
}
