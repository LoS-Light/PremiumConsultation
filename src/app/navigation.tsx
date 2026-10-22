import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';

import { ConsultationScreen } from '../features/consultation/view/ConsultationScreen';
import { DialogDemoScreen } from '../features/dialogDemo/view/DialogDemoScreen';
import { HomeScreen } from '../features/home/view/HomeScreen';

export type RootStackParamList = {
  Home: undefined;
  Consultation: undefined;
  DialogDemo: undefined;
};

// Types useNavigation() and route names app-wide.
declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}

const Stack = createStackNavigator<RootStackParamList>();

// Home → Consultation and Home → Dialog demo (SPEC §4.1). A JS stack with iOS's push on both
// platforms (ADR-013): the new screen slides in from the right over the previous one, which
// shifts a little to the left, and a swipe from the left edge follows the finger back. Every
// screen draws its own top bar, so the stack's header is hidden; the Android back button
// still goes back.
export function RootNavigator({
  initialRouteName = 'Home',
}: {
  initialRouteName?: keyof RootStackParamList;
}) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        // On by default on iOS only; the swipe back is wanted on Android too.
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Consultation" component={ConsultationScreen} />
      <Stack.Screen name="DialogDemo" component={DialogDemoScreen} />
    </Stack.Navigator>
  );
}
