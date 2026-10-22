// What the guard needs from a screen's navigation object.
export interface GuardableNavigation<RouteName extends string = string> {
  isFocused(): boolean;
  navigate(routeName: RouteName): void;
  goBack(): void;
}

// Navigation re-entry guard (SPEC §8a, layer 2). Every screen-initiated navigation goes
// through it, so a screen can never be pushed twice. It is decided by state, not time, and the
// state lives in a ref-like object so two calls in the same tick both see the first one.
export function createNavigationGuard() {
  const isNavigationInFlight = { current: false };

  return {
    guardedNavigate<RouteName extends string>(
      navigation: GuardableNavigation<RouteName>,
      routeName: RouteName,
    ) {
      // A focus check alone isn't enough: in the same tick the calling screen is still focused.
      if (isNavigationInFlight.current || !navigation.isFocused()) {
        return;
      }
      isNavigationInFlight.current = true;
      navigation.navigate(routeName);
    },
    // A screen that is already animating out is no longer focused, so it can't go back twice.
    guardedGoBack(navigation: GuardableNavigation) {
      if (navigation.isFocused()) {
        navigation.goBack();
      }
    },
    // Called by the navigator whenever a screen gains focus, which ends the navigation either
    // way: the target screen got focus (the calling screen is no longer focused, so the focus
    // check above still blocks its repeated calls), or the calling screen got it back (a back
    // interrupted the push).
    handleScreenFocus() {
      isNavigationInFlight.current = false;
    },
  };
}

export type NavigationGuard = ReturnType<typeof createNavigationGuard>;
