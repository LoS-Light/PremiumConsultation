import {
  BottomSheetFlatList,
  BottomSheetFooter,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../../../shared/theme';
import { ElasticContentBottomSheet } from '../../../shared/ui/ElasticContentBottomSheet';
import { useSpecialists } from '../viewmodel/useSpecialists';
import { ConsultationBottomSection } from './ConsultationBottomSection';
import { ConsultationHeader } from './ConsultationHeader';
import { ConsultationHero } from './ConsultationHero';
import { ConsultationNavBar } from './ConsultationNavBar';
import {
  collapsedSheetTop,
  CONTENT_GAP,
  CONTENT_PADDING_HORIZONTAL,
  NAV_BAR_BOTTOM_PADDING,
  NAV_BAR_ROW_HEIGHT,
} from './layout';
import { SpecialistCard } from './SpecialistCard';
import { EmptyState } from './states/EmptyState';
import { SpecialistSkeleton } from './states/SpecialistSkeleton';

// The hero is a fixed background; the content is a bottom sheet over it (ADR-012). The sheet
// opens collapsed at Figma's card position and can only grow, up to just below the nav bar.
// Once it is expanded, dragging scrolls its list. The service hours and buttons are its footer.
export function ConsultationScreen() {
  const { data: specialists = [], isPending, isError } = useSpecialists();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // The list's bottom padding equals the footer's height, so nothing hides behind it.
  const [footerHeight, setFooterHeight] = useState(0);

  const snapPoints = useMemo(() => {
    const expandedTop = insets.top + NAV_BAR_ROW_HEIGHT + NAV_BAR_BOTTOM_PADDING;
    return [height - collapsedSheetTop(width), height - expandedTop];
  }, [height, width, insets.top]);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props}>
        <ConsultationBottomSection onHeightChange={setFooterHeight} />
      </BottomSheetFooter>
    ),
    [],
  );

  return (
    <View style={styles.screen}>
      <ConsultationHero />
      <ElasticContentBottomSheet
        index={0}
        snapPoints={snapPoints}
        // Appear already collapsed, without sliding up on mount.
        animateOnMount={false}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        // Pulling down when collapsed bounces the list, not the sheet.
        handleComponent={null}
        backgroundStyle={styles.sheetBackground}
        footerComponent={renderFooter}
      >
        <BottomSheetFlatList
          data={specialists}
          keyExtractor={(specialist) => specialist.id}
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <SpecialistCard specialist={item} />
            </View>
          )}
          ListHeaderComponent={<ConsultationHeader />}
          ListEmptyComponent={<ListBodyState isPending={isPending} isError={isError} />}
          contentContainerStyle={{ paddingBottom: footerHeight }}
        />
      </ElasticContentBottomSheet>
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
  sheetBackground: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  cell: {
    paddingHorizontal: CONTENT_PADDING_HORIZONTAL,
    paddingBottom: CONTENT_GAP,
  },
});
