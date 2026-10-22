import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDialog } from '../../../shared/dialog/DialogProvider';

type DemoDialogName = 'A' | 'B' | 'C';

// The demo of the brief's bonus question, "multiple buttons and multiple such dialogs"
// (SPEC §8). A dialog covers the screen, so requests that would come from several buttons or
// events at the same moment are sent in the same tick.
export function useDemoDialogs() {
  const { t } = useTranslation();
  const dialogs = useDialog();

  return useMemo(() => {
    const showDialog = (name: DemoDialogName) => {
      const id = `demo${name}`;
      dialogs.show(id, {
        title: t('dialogDemo.dialogTitle', { name }),
        body: t('dialogDemo.dialogBody', { name, id }),
        buttonLabel: t('dialogDemo.ok'),
      });
    };

    return {
      // One dialog: pressing quickly twice still shows it once.
      showDialogA: () => showDialog('A'),
      // Two entry points asking for the same dialog: it shows once.
      showSameFromTwoButtons: () => {
        showDialog('A');
        showDialog('A');
      },
      // Three features each asking for their own dialog: they show one after another.
      showThreeAtOnce: () => {
        showDialog('A');
        showDialog('B');
        showDialog('C');
      },
    };
  }, [dialogs, t]);
}
