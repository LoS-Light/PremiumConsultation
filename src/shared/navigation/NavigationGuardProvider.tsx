import { useNavigation } from '@react-navigation/native';
import { createContext, type ReactNode, useContext, useMemo } from 'react';

import type { NavigationGuard } from './navigationGuard';

const NavigationGuardContext = createContext<NavigationGuard | null>(null);

// Provides the app's one navigation guard to every screen (SPEC §8a, layer 2).
export function NavigationGuardProvider({
  guard,
  children,
}: {
  guard: NavigationGuard;
  children: ReactNode;
}) {
  return (
    <NavigationGuardContext.Provider value={guard}>{children}</NavigationGuardContext.Provider>
  );
}

type RouteName = keyof ReactNavigation.RootParamList;

// The only way screens navigate: never call navigation.navigate directly (SPEC §14a).
export function useGuardedNavigation() {
  const guard = useContext(NavigationGuardContext);
  if (guard === null) {
    throw new Error('useGuardedNavigation must be used inside a NavigationGuardProvider.');
  }
  const navigation = useNavigation();

  return useMemo(() => {
    const guardable = {
      isFocused: () => navigation.isFocused(),
      navigate: (name: RouteName) => navigation.navigate(name),
      goBack: () => navigation.goBack(),
    };
    return {
      navigate: (routeName: RouteName) => guard.guardedNavigate(guardable, routeName),
      goBack: () => guard.guardedGoBack(guardable),
    };
  }, [guard, navigation]);
}
