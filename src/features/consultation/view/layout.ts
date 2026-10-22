import { DESIGN_WIDTH } from '../../../shared/theme';

// The white content area of the Consultation screen (Figma content frame 2:139).
export const CONTENT_PADDING_HORIZONTAL = 35;
export const CONTENT_GAP = 7;

// Nav bar below the status bar: a 42 pt row plus 6 pt bottom padding (Figma "Fix Nav").
export const NAV_BAR_ROW_HEIGHT = 42;
export const NAV_BAR_BOTTOM_PADDING = 6;

// In Figma the white card starts at y = 230 on a 390 pt wide frame; scale it to the screen.
const CARD_TOP_IN_DESIGN = 230;
export function collapsedSheetTop(screenWidth: number): number {
  return (CARD_TOP_IN_DESIGN * screenWidth) / DESIGN_WIDTH;
}

// How far a finger moves (pt) before a drag on the content sheet or the bottom section counts
// as vertical (and is theirs) or horizontal (and is left to the stack's swipe back, ADR-013).
export const VERTICAL_DRAG_THRESHOLD: [number, number] = [-10, 10];
