import { createDialogQueue, type DialogRequest } from './dialogQueue';

type Content = string;

// A queue whose shown dialog is recorded each time it changes, as the UI would render it.
function queueWithHistory() {
  const shown: (string | null)[] = [];
  const queue = createDialogQueue<Content>((current) => shown.push(current?.id ?? null));
  return { queue, shown };
}

function dialog(id: string): DialogRequest<Content> {
  return { id, content: `content of ${id}` };
}

describe('DialogManager queue', () => {
  test('shows one dialog when the same ID is requested twice', () => {
    const { queue, shown } = queueWithHistory();

    queue.show(dialog('a'));
    queue.show(dialog('a'));

    expect(shown).toEqual(['a']);
  });

  test('queues a different ID and shows it when the current dialog closes', () => {
    const { queue, shown } = queueWithHistory();

    queue.show(dialog('a'));
    queue.show(dialog('b'));
    expect(shown).toEqual(['a']);

    queue.close('a');
    expect(shown).toEqual(['a', 'b']);

    queue.close('b');
    expect(shown).toEqual(['a', 'b', null]);
  });

  test('ignores an ID that is already queued', () => {
    const { queue, shown } = queueWithHistory();

    queue.show(dialog('a'));
    queue.show(dialog('b'));
    queue.show(dialog('b'));
    queue.close('a');
    queue.close('b');

    expect(shown).toEqual(['a', 'b', null]);
  });

  test('shows an ID again when it is requested after it closed', () => {
    const { queue, shown } = queueWithHistory();

    queue.show(dialog('a'));
    queue.show(dialog('b'));
    queue.close('a'); // A closes: it is neither showing nor queued now
    queue.show(dialog('a')); // so this is a new request, queued behind B
    queue.close('b');
    queue.close('a');

    expect(shown).toEqual(['a', 'b', 'a', null]);
  });

  // e.g. the Android back button and the dialog's button both closing A
  test('closing a dialog that has already closed leaves the next one showing', () => {
    const { queue, shown } = queueWithHistory();

    queue.show(dialog('a'));
    queue.show(dialog('b'));
    queue.close('a');
    queue.close('a');

    expect(shown).toEqual(['a', 'b']);
  });
});
