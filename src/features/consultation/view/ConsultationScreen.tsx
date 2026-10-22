import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, View } from 'react-native';

import { COLORS } from '../../../shared/theme';
import { ConsultationHeader } from './ConsultationHeader';
import { ConsultationNavBar } from './ConsultationNavBar';

// The whole page is one FlatList so the list stays virtualized (ADR-005). Specialists,
// the footer and the bottom section arrive in later tickets.
export function ConsultationScreen() {
  return (
    <View style={styles.screen}>
      <FlatList data={[]} ListHeaderComponent={<ConsultationHeader />} />
      <ConsultationNavBar />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
});
