import { createDialogQueue, type DialogQueuePolicy, type DialogRequest } from './dialogQueue';

type Content = string;

// A queue whose shown dialogs are recorded each time they change, as the UI would render them.
// The policy can be changed mid-test, as a flag switched at runtime would.
function queueWithHistory(initialPolicy: Partial<DialogQueuePolicy> = {}) {
  const shown: string[][] = [];
  let lastVisible: { key: number }[] = [];
  let policy: DialogQueuePolicy = { isDeduplicationOn: true, isQueueOn: true, ...initialPolicy };
  const queue = createDialogQueue<Content>(
    (visible) => {
      lastVisible = visible;
      shown.push(visible.map(({ id }) => id));
    },
    () => policy,
  );
  return {
    queue,
    shown,
    // The key of the dialog on top, as the UI passes it when its button closes it.
    topKey: () => lastVisible[lastVisible.length - 1]!.key,
    setPolicy: (change: Partial<DialogQueuePolicy>) => {
      policy = { ...policy, ...change };
    },
  };
}

function dialog(id: string): Omit<DialogRequest<Content>, 'key'> {
  return { id, content: `content of ${id}` };
}

describe('DialogManager queue', () => {
  test('shows one dialog when the same ID is requested twice', () => {
    const { queue, shown } = queueWithHistory();

    queue.show(dialog('a'));
    queue.show(dialog('a'));

    expect(shown).toEqual([['a']]);
  });

  test('queues a different ID and shows it when the current dialog closes', () => {
    const { queue, shown, topKey } = queueWithHistory();

    queue.show(dialog('a'));
    queue.show(dialog('b'));
    expect(shown).toEqual([['a']]);

    queue.close(topKey());
    expect(shown).toEqual([['a'], ['b']]);

    queue.close(topKey());
    expect(shown).toEqual([['a'], ['b'], []]);
  });

  test('ignores an ID that is already queued', () => {
    const { queue, shown, topKey } = queueWithHistory();

    queue.show(dialog('a'));
    queue.show(dialog('b'));
    queue.show(dialog('b'));
    queue.close(topKey());
    queue.close(topKey());

    expect(shown).toEqual([['a'], ['b'], []]);
  });

  test('shows an ID again when it is requested after it closed', () => {
    const { queue, shown, topKey } = queueWithHistory();

    queue.show(dialog('a'));
    queue.show(dialog('b'));
    queue.close(topKey()); // A closes: it is neither showing nor queued now
    queue.show(dialog('a')); // so this is a new request, queued behind B
    queue.close(topKey());
    queue.close(topKey());

    expect(shown).toEqual([['a'], ['b'], ['a'], []]);
  });

  // e.g. the Android back button and the dialog's button both closing A
  test('closing a dialog that has already closed leaves the next one showing', () => {
    const { queue, shown, topKey } = queueWithHistory();

    queue.show(dialog('a'));
    queue.show(dialog('b'));
    const keyOfA = topKey();
    queue.close(keyOfA);
    queue.close(keyOfA);

    expect(shown).toEqual([['a'], ['b']]);
  });

  // The Feature toggles sheet can switch each rule off for the demo (SPEC §8).
  describe('with its rules switched off', () => {
    test('without de-duplication, the same ID twice is shown twice in turn', () => {
      const { queue, shown, topKey } = queueWithHistory({ isDeduplicationOn: false });

      queue.show(dialog('a'));
      queue.show(dialog('a'));
      queue.close(topKey());
      queue.close(topKey());

      expect(shown).toEqual([['a'], ['a'], []]);
    });

    test('without the queue, different dialogs show at once, stacked', () => {
      const { queue, shown, topKey } = queueWithHistory({ isQueueOn: false });

      queue.show(dialog('a'));
      queue.show(dialog('b'));
      queue.close(topKey()); // the top one

      expect(shown).toEqual([['a'], ['a', 'b'], ['a']]);
    });

    test('without either, the same ID twice is stacked twice', () => {
      const { queue, shown, topKey } = queueWithHistory({
        isDeduplicationOn: false,
        isQueueOn: false,
      });

      queue.show(dialog('a'));
      queue.show(dialog('a'));
      queue.close(topKey());
      queue.close(topKey());

      expect(shown).toEqual([['a'], ['a', 'a'], ['a'], []]);
    });

    // e.g. the dialog's button pressed twice quickly with the press throttle off
    test('closing a stacked dialog twice leaves the one below with the same ID', () => {
      const { queue, shown, topKey } = queueWithHistory({
        isDeduplicationOn: false,
        isQueueOn: false,
      });

      queue.show(dialog('a'));
      queue.show(dialog('a'));
      const keyOfTop = topKey();
      queue.close(keyOfTop);
      queue.close(keyOfTop);

      expect(shown).toEqual([['a'], ['a', 'a'], ['a']]);
    });

    test('switching the queue off while dialogs wait shows them at once, and they still close', () => {
      const { queue, shown, topKey, setPolicy } = queueWithHistory();

      queue.show(dialog('a'));
      queue.show(dialog('b'));
      setPolicy({ isQueueOn: false });
      queue.refresh();
      queue.close(topKey());

      expect(shown).toEqual([['a'], ['a', 'b'], ['a']]);
    });
  });
});
