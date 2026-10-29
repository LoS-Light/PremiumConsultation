// Offset pagination (ADR-007): a page is asked for by offset and size, and says how many
// items the source holds in total.
export interface PageParams {
  offset: number;
  limit: number;
}

export interface Page<T> {
  items: T[];
  /** Offset this page started at. */
  offset: number;
  /** Requested page size. */
  limit: number;
  /** Total number of items in the source. */
  total: number;
}
