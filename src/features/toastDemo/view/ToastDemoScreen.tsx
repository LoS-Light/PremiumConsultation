import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { HeroActionsScreen } from '../../../shared/ui/HeroActionsScreen';
import { PrimaryButton } from '../../../shared/ui/PrimaryButton';
import { type ToastName, useToastStack } from '../viewmodel/useToastStack';
import { ToastMessage } from './ToastMessage';

const TOAST_NAMES: ToastName[] = ['A', 'B', 'C'];

// Demo of the press throttle (SPEC §8a, layer 1). Not in Figma: Home's layout with the back nav
// bar, toasts stacking above three buttons. Every press that gets through shows a toast, so
// switching the throttle off in Feature toggles shows a toast for every press.
export function ToastDemoScreen() {
  const { t } = useTranslation();
  const { toasts, show, remove } = useToastStack();

  return (
    <HeroActionsScreen
      hasBackButton
      actions={TOAST_NAMES.map((name) => (
        <PrimaryButton
          key={name}
          label={t('toastDemo.button', { name })}
          onPress={() => show(name)}
        />
      ))}
    >
      <View style={styles.toasts} pointerEvents="none">
        {toasts.map((toast) => (
          <ToastMessage
            key={toast.key}
            toastKey={toast.key}
            text={t('toastDemo.message', { name: toast.name, count: toast.count })}
            onDone={remove}
          />
        ))}
      </View>
    </HeroActionsScreen>
  );
}

const styles = StyleSheet.create({
  // Fills the space above the buttons; the newest toast sits at the bottom, and older ones
  // move up and are clipped under the hero when there are many.
  toasts: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 8,
    paddingBottom: 20,
    overflow: 'hidden',
  },
});
