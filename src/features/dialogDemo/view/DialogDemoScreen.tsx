import { useTranslation } from 'react-i18next';

import { HeroActionsScreen } from '../../../shared/ui/HeroActionsScreen';
import { PrimaryButton } from '../../../shared/ui/PrimaryButton';
import { useDemoDialogs } from '../viewmodel/useDemoDialogs';

// Demo of the DialogManager with several dialogs (SPEC §8). Not in Figma: Home's layout with the
// back nav bar, and three buttons for the brief's bonus question.
export function DialogDemoScreen() {
  const { t } = useTranslation();
  const demo = useDemoDialogs();

  return (
    <HeroActionsScreen
      hasBackButton
      actions={
        <>
          <PrimaryButton label={t('dialogDemo.oneDialog')} onPress={demo.showDialogA} />
          <PrimaryButton
            label={t('dialogDemo.sameFromTwoButtons')}
            onPress={demo.showSameFromTwoButtons}
          />
          <PrimaryButton label={t('dialogDemo.threeAtOnce')} onPress={demo.showThreeAtOnce} />
        </>
      }
    />
  );
}
