import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetFooter,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../../../shared/theme';
import { HeroBanner } from '../../../shared/ui/HeroBanner';
import { useSpecialists } from '../viewmodel/useSpecialists';
import { AgreementsNotice } from './AgreementsNotice';
import { ConsultationBottomSection } from './ConsultationBottomSection';
import { ConsultationHeader } from './ConsultationHeader';
import { ConsultationNavBar } from './ConsultationNavBar';
import { ContactInfo } from './ContactInfo';
import {
  collapsedSheetTop,
  CONTENT_GAP,
  CONTENT_PADDING_HORIZONTAL,
  NAV_BAR_BOTTOM_PADDING,
  NAV_BAR_ROW_HEIGHT,
  VERTICAL_DRAG_THRESHOLD,
} from './layout';
import { SpecialistCard } from './SpecialistCard';
import { EmptyState } from './states/EmptyState';
import { SpecialistSkeleton } from './states/SpecialistSkeleton';

// The hero is a fixed background; the content is a bottom sheet over it (ADR-012). The sheet
// opens collapsed at Figma's card position and can only grow, up to just below the nav bar.
// Once it is expanded, dragging scrolls its list. The service hours and buttons are its footer.
export function ConsultationScreen() {
  const { data: specialists = [], isPending, isError } = useSpecialists();
  // The sheet measures its container, which fills the whole screen. useWindowDimensions() leaves
  // out the status and navigation bars on Android (edge-to-edge), which put the sheet about
  // 75 dp too low there, so use the full frame instead.
  const { width, height } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  // The list's bottom padding equals the sheet footer's (bottom section's) height, so nothing
  // hides behind it.
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
      <HeroBanner />
      <BottomSheet
        index={0}
        snapPoints={snapPoints}
        // Appear already collapsed, without sliding up on mount.
        animateOnMount={false}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        // Pulling down at the collapsed point stretches the sheet a little and springs it back.
        enableOverDrag
        // Only vertical drags move the sheet; a horizontal one fails, so a swipe from the left
        // edge reaches the stack's swipe back (ADR-013).
        activeOffsetY={VERTICAL_DRAG_THRESHOLD}
        failOffsetX={VERTICAL_DRAG_THRESHOLD}
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
          ListFooterComponent={<ListEnd />}
          contentContainerStyle={{ paddingBottom: footerHeight }}
          // The library turns Android's overscroll off; turn it back on so the end of the list
          // stretches and springs back there, as iOS bounces.
          overScrollMode="always"
        />
      </BottomSheet>
      <ConsultationNavBar />
      <StatusBar style="dark" />
    </View>
  );
}

// Below the Specialists: contact info, then the agreements notice (Figma 2:139).
function ListEnd() {
  return (
    <View style={styles.listEnd}>
      <ContactInfo />
      <AgreementsNotice />
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
  // Figma: 32 pt from the last card (whose cell already adds 7) and between the blocks. Below
  // the agreements, the full-length frame leaves 13 pt before the bottom section (968 → 981).
  listEnd: {
    paddingTop: 32 - CONTENT_GAP,
    paddingBottom: 13,
    paddingHorizontal: CONTENT_PADDING_HORIZONTAL,
    gap: 32,
  },
  cell: {
    paddingHorizontal: CONTENT_PADDING_HORIZONTAL,
    paddingBottom: CONTENT_GAP,
  },
});
