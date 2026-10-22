import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useDialog } from '../../../shared/dialog/DialogProvider';

const COMING_SOON_DIALOG_ID = 'comingSoon';

// The dialog shown instead of the Consultation screen while Premium consultation is disabled
// (SPEC §7, §8). One ID, so however many places ask for it, it shows once.
export function useComingSoonDialog() {
  const { t } = useTranslation();
  const dialogs = useDialog();

  return useCallback(
    () =>
      dialogs.show(COMING_SOON_DIALOG_ID, {
        title: t('comingSoon.title'),
        body: t('comingSoon.body'),
        buttonLabel: t('comingSoon.ok'),
      }),
    [dialogs, t],
  );
}
