import { createNavigationGuard } from './navigationGuard';

// A stand-in for a screen's navigation object: only what the guard uses.
function fakeNavigation({ isFocused = true } = {}) {
  return { isFocused: jest.fn(() => isFocused), navigate: jest.fn(), goBack: jest.fn() };
}

describe('guardedNavigate', () => {
  test('navigates once when called twice in the same tick', () => {
    const guard = createNavigationGuard();
    const navigation = fakeNavigation();

    guard.guardedNavigate(navigation, 'Consultation');
    guard.guardedNavigate(navigation, 'Consultation');

    expect(navigation.navigate).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).toHaveBeenCalledWith('Consultation');
  });

  test('ignores a call from a screen that is not focused', () => {
    const guard = createNavigationGuard();
    // e.g. the calling screen is already animating out
    const navigation = fakeNavigation({ isFocused: false });

    guard.guardedNavigate(navigation, 'Consultation');

    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  test('navigates again after a screen gains focus', () => {
    const guard = createNavigationGuard();
    const navigation = fakeNavigation();

    guard.guardedNavigate(navigation, 'Consultation');
    guard.handleScreenFocus();
    guard.guardedNavigate(navigation, 'Consultation');

    expect(navigation.navigate).toHaveBeenCalledTimes(2);
  });

  test('ignores going back from a screen that is not focused', () => {
    const guard = createNavigationGuard();
    // e.g. the back button pressed again while the screen is already animating out
    const navigation = fakeNavigation({ isFocused: false });

    guard.guardedGoBack(navigation);

    expect(navigation.goBack).not.toHaveBeenCalled();
  });
});
