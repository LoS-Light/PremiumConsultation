import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetFooter,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type ListRenderItemInfo, View } from 'react-native';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Specialist } from '../../../domain/specialist/Specialist';
import { makeStyles } from '../../../shared/theme';
import {
  BackNavBar,
  NAV_BAR_BOTTOM_PADDING,
  NAV_BAR_ROW_HEIGHT,
} from '../../../shared/ui/BackNavBar';
import { HeroBanner } from '../../../shared/ui/HeroBanner';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { useConsultationGate } from '../viewmodel/useConsultationGate';
import { useInfiniteSpecialistsQuery } from '../viewmodel/useInfiniteSpecialistsQuery';
import { AgreementsNotice } from './AgreementsNotice';
import { ConsultationBottomSection } from './ConsultationBottomSection';
import { ConsultationHeader } from './ConsultationHeader';
import { ContactInfo } from './ContactInfo';
import {
  collapsedSheetTop,
  CONTENT_GAP,
  CONTENT_PADDING_HORIZONTAL,
  VERTICAL_DRAG_THRESHOLD,
} from './layout';
import { SpecialistCard } from './SpecialistCard';
import { useContentSheetAnimationConfigs } from './useContentSheetAnimationConfigs';
import { useNextPageSpinner } from './useNextPageSpinner';
import { EmptyState } from './states/EmptyState';
import { InlineErrorView } from './states/InlineErrorView';
import { SpecialistSkeleton } from './states/SpecialistSkeleton';

// The Consultation screen, behind the premiumConsultation flag (SPEC §7). While the flag is
// off it shows nothing and leaves (useConsultationGate), so it never loads the Specialists.
export function ConsultationScreen() {
  const styles = useStyles();
  const isEnabled = useConsultationGate();
  return isEnabled ? <ConsultationContent /> : <View style={styles.screen} />;
}

// The hero is a fixed background; the content is a bottom sheet over it (ADR-012). The sheet
// opens collapsed at Figma's card position and can only grow, up to just below the nav bar.
// Once it is expanded, dragging scrolls its list. The service hours and buttons are its footer.
function ConsultationContent() {
  const styles = useStyles();
  const {
    specialists,
    isLoadingFirstPage,
    isError,
    isFetchingNextPage,
    hasNextPageFailed,
    loadMore,
    retry,
    retryNextPage,
  } = useInfiniteSpecialistsQuery();
  const nextPageSpinner = useNextPageSpinner({ isFetchingNextPage, hasNextPageFailed });
  // The sheet measures its container, which fills the whole screen. useWindowDimensions() leaves
  // out the status and navigation bars on Android (edge-to-edge), which put the sheet about
  // 75 dp too low there, so use the full frame instead.
  const { width, height } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  // The list's bottom padding equals the sheet footer's (bottom section's) height, so nothing
  // hides behind it.
  const [footerHeight, setFooterHeight] = useState(0);
  const animationConfigs = useContentSheetAnimationConfigs();

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
        animationConfigs={animationConfigs}
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
          keyExtractor={specialistKey}
          renderItem={renderSpecialist}
          ListHeaderComponent={<ConsultationHeader />}
          ListEmptyComponent={
            <ListBodyState isLoading={isLoadingFirstPage} isError={isError} onRetry={retry} />
          }
          ListFooterComponent={
            <ListEnd
              isSpinnerShown={nextPageSpinner.isShown}
              hasNextPageFailed={hasNextPageFailed}
              onRetryNextPage={retryNextPage}
            />
          }
          // Load the next page when a fifth of a screen of list is left (SPEC §6.2).
          onEndReached={loadMore}
          onEndReachedThreshold={0.2}
          onContentSizeChange={nextPageSpinner.handleContentSizeChange}
          testID="specialist-list"
          contentContainerStyle={{ paddingBottom: footerHeight }}
          // The library turns Android's overscroll off; turn it back on so the end of the list
          // stretches and springs back there, as iOS bounces.
          overScrollMode="always"
        />
      </BottomSheet>
      <BackNavBar />
      {/* Dark text on the light hero, light text on the dark one. */}
      <StatusBar style="auto" />
    </View>
  );
}

function specialistKey(specialist: Specialist) {
  return specialist.id;
}

function renderSpecialist({ item }: ListRenderItemInfo<Specialist>) {
  return <SpecialistCell specialist={item} />;
}

function SpecialistCell({ specialist }: { specialist: Specialist }) {
  const styles = useStyles();
  return (
    <View style={styles.cell}>
      <SpecialistCard specialist={specialist} />
    </View>
  );
}

// Below the Specialists: the next-page spinner while it shows, then the contact info and the
// agreements notice (Figma 2:139), reached once every page is loaded (SPEC §6.5).
function ListEnd({
  isSpinnerShown,
  hasNextPageFailed,
  onRetryNextPage,
}: {
  isSpinnerShown: boolean;
  hasNextPageFailed: boolean;
  onRetryNextPage: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <>
      {isSpinnerShown && (
        <View style={styles.nextPageSpinner}>
          <LoadingSpinner
            testID="next-page-spinner"
            accessibilityLabel={t('consultation.specialists.loadingMore')}
          />
        </View>
      )}
      {hasNextPageFailed && <InlineErrorView onRetry={onRetryNextPage} />}
      <View style={styles.listEnd}>
        <ContactInfo />
        <AgreementsNotice />
      </View>
    </>
  );
}

// What the list body shows when there are no Specialists to list.
function ListBodyState({
  isLoading,
  isError,
  onRetry,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return <SpecialistSkeleton />;
  }
  if (isError) {
    return <InlineErrorView onRetry={onRetry} />;
  }
  return <EmptyState />;
}

// Space above and below the next-page spinner (the list end's own top space adds the gap below).
const SPINNER_SPACE = 24;

const useStyles = makeStyles(({ colors }) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  sheetBackground: {
    backgroundColor: colors.surface,
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
  // The last cell already adds CONTENT_GAP above the spinner.
  nextPageSpinner: {
    paddingTop: SPINNER_SPACE - CONTENT_GAP,
    alignItems: 'center',
  },
  cell: {
    paddingHorizontal: CONTENT_PADDING_HORIZONTAL,
    paddingBottom: CONTENT_GAP,
  },
}));
