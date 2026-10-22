import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, View } from 'react-native';

import { COLORS } from '../../../shared/theme';
import { ConsultationHeader } from './ConsultationHeader';
import { ConsultationNavBar } from './ConsultationNavBar';
import { CONTENT_GAP, CONTENT_PADDING_HORIZONTAL } from './layout';
import { SpecialistCard } from './SpecialistCard';
import { EmptyState } from './states/EmptyState';
import { SpecialistSkeleton } from './states/SpecialistSkeleton';
import { useSpecialists } from '../viewmodel/useSpecialists';

// The whole page is one FlatList so the list stays virtualized (ADR-005). The footer and the
// bottom section arrive in later tickets.
export function ConsultationScreen() {
  const { data: specialists = [], isPending, isError } = useSpecialists();

  return (
    <View style={styles.screen}>
      <FlatList
        data={specialists}
        keyExtractor={(specialist) => specialist.id}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <SpecialistCard specialist={item} />
          </View>
        )}
        ListHeaderComponent={<ConsultationHeader />}
        ListEmptyComponent={<ListBodyState isPending={isPending} isError={isError} />}
      />
      <ConsultationNavBar />
      <StatusBar style="dark" />
    </View>
  );
}

// What the list body shows when there are no Specialists to list.
function ListBodyState({ isPending, isError }: { isPending: boolean; isError: boolean }) {
  if (isPending) {
    return <SpecialistSkeleton />;
  }
  if (isError) {
    // A failed load is not an empty list. v1.0.0 has no error view (SPEC §10); v1.1.0 adds it.
    return null;
  }
  return <EmptyState />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  cell: {
    paddingHorizontal: CONTENT_PADDING_HORIZONTAL,
    paddingBottom: CONTENT_GAP,
  },
});
