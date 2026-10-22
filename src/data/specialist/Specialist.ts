// A person on the ES team who gives users one-to-one consultations (GLOSSARY.md).
export interface Specialist {
  id: string;
  name: string;
  avatarUrl?: string;
}

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
