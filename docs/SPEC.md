# Premium Consultation — Specification

> Take-home assignment: React Native (Expo + TypeScript).
> Status: draft. Items marked **[ASSUMPTION]** are pending confirmation from the interviewer (see §15).

---

## 1. Overview

Build the **Premium Consultation** screen of the GUM app. The screen introduces GUM Specialists (ES team), lists them, and offers two actions — **Book appointment** and **WhatsApp us** — in a persistent bottom section. The goal (per PRD) is a clear, approachable contact section similar to Bowtie's consultation UI, and pre-filled WhatsApp messages so the ES team can identify and prioritise app users.

The work is submitted as a **pull request** against an empty repository and reviewed by the interviewer. AI-written code is allowed, but every design decision must be explainable by the author. Decisions are recorded as ADRs in `docs/adr/`.

### Sources

| Source | Notes |
|---|---|
| Assignment brief | Epic ticket (PDF) — technical requirements and senior tasks |
| PRD | Confluence "Premium Consultation" — behaviour, copy, URLs and contact values. Provided as a zip; read it during implementation (see §11a) |
| Figma | Visual design; read via Figma MCP during implementation (see §11) |

When the PRD and Figma disagree on **behaviour or copy**, the PRD wins. Figma is the source for **visuals**.

---

## 2. Goals and non-goals

### Goals

- Consultation screen matching the Figma design and PRD behaviour
- Data loading via TanStack Query, with loading, error and empty states
- Persistent bottom section via `@gorhom/bottom-sheet`
- Localization: English and Traditional Chinese (Hong Kong), copy from the PRD
- Specialist data source behind an abstraction so the hardcoded list can be swapped for a CMS (planned for Q2) without touching UI or hooks
- **Senior:** feature flag gating the screen, de-duplicated "coming soon" dialog, infinite-scroll specialist list
- Reproducible build, CI on the PR, clear README

### Non-goals

- Booking flow inside the app (handled by the external booking site)
- Real CMS integration (only the interface and a stub)
- Specialist interaction (PRD: static list, no interaction)
- Authentication
- Liquid-glass effect on the bottom section (PRD: ignore it, use a white background)

---

## 3. Tech stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | Expo (managed), TypeScript, blank template | Reproducible build with minimal native setup; no custom native code required |
| Navigation | React Navigation (native stack) **[ASSUMPTION]** | Two screens only; explicit and easy to explain. Expo Router is an acceptable alternative |
| Data fetching | TanStack Query (`useQuery`, `useInfiniteQuery`) | Required by the brief; built-in loading/error/retry/pagination |
| Bottom sheet | `@gorhom/bottom-sheet` (+ `react-native-reanimated`, `react-native-gesture-handler`) | Required by the brief |
| In-app browser | `expo-web-browser` | PRD: booking opens in an in-app browser that offers "open in external browser" |
| External links | `Linking` (React Native) | `tel:`, `mailto:`, WhatsApp universal link |
| i18n | `i18next`, `react-i18next`, `expo-localization` | Device-language detection, runtime switching, `<Trans>` for inline links |
| Fonts | `expo-font` / `@expo-google-fonts` (families per Figma) | Match Figma typography |
| Testing | Jest (`jest-expo`), React Native Testing Library | Standard for Expo |
| Lint/format | ESLint, Prettier | |
| Node | Pinned in `.nvmrc` and `package.json#engines` | Reproducibility |

---

## 4. Screens

### 4.1 Home (entry point) — not in Figma / PRD

Minimal screen that exists to satisfy the senior requirement.

- Button: **"Premium consultation"** (i18n key)
- On press:
  - Feature flag `premiumConsultation` **enabled** → navigate to Consultation screen
  - **disabled** → show "Coming soon" dialog (see §8)
- Dev-only controls (visible in `__DEV__` builds, used for the demo video):
  - Toggle feature flag on/off
  - Switch language (English / 中文（香港）)
  - Switch specialist list mode: `plain` / `infinite`
  - Toggle simulated loading failure (to demo the error state)

> **[ASSUMPTION]** The brief says the Figma screen is the entry point, while the senior section asks for a button-based entry. This spec adds a Home screen for the senior flow (§15, Q2).

### 4.2 Consultation screen

Structure (top to bottom):

```
ConsultationScreen
├─ Fixed nav bar with back icon — rendered, but pressing it does nothing (PRD)
├─ FlatList (single scroll container for the whole page)
│   ├─ ListHeaderComponent
│   │   ├─ Hero photo banner of ES team members
│   │   └─ White content card with rounded top corners, overlapping the hero
│   │       ├─ Overline:   "Got more questions?"
│   │       ├─ Title:      "GUM Specialists are here!" + divider
│   │       └─ Description
│   ├─ data → SpecialistCard × N
│   ├─ ListEmptyComponent → loading skeleton / inline error / empty (first page)
│   └─ ListFooterComponent
│       ├─ Next-page loading indicator or next-page inline error (infinite mode)
│       ├─ Contact info with tappable hotline and email
│       └─ Agreements notice (privacy statement)
│   └─ Bottom padding equal to the bottom section height
└─ Persistent bottom section (white background)
    ├─ Service hours
    ├─ Primary button (black): "Book appointment"
    └─ Primary button (black): "WhatsApp us"
```

**Why one FlatList:** wrapping a FlatList in a ScrollView disables virtualization. Putting the header and footer content into `ListHeaderComponent` / `ListFooterComponent` keeps a single, virtualized scroll container. (ADR-005)

**Back button:** the PRD says the return button is ignored. It is rendered for visual fidelity with no action. Users can still leave via the native back gesture / Android back button. **[ASSUMPTION]** that the native gesture is acceptable given the added Home screen (§15, Q3).

### 4.3 SpecialistCard

- Card with rounded corners and drop shadow; photo and name (visual details from Figma)
- **Static, no interaction** (PRD)
- Placeholder image when `avatarUrl` is missing
- Hidden layers in Figma (tags, timestamps, icons) are leftovers and **not implemented**

### 4.4 Bottom section

- Built with `BottomSheet` (not `BottomSheetModal`): always visible, persists at the bottom of the page (PRD)
- `index={0}`, `enablePanDownToClose={false}`, `enableDynamicSizing` (height follows content)
- White background; no liquid-glass / blur effect (PRD)
- Respects the bottom safe-area inset

### 4.5 Actions

| Element | Behaviour (see PRD) | Implementation |
|---|---|---|
| Book appointment | Open the booking platform in an **in-app browser** that lets the member open it externally | `WebBrowser.openBrowserAsync(BOOKING_URL)` — SFSafariViewController (iOS) / Chrome Custom Tabs (Android) both provide a built-in "open in browser" control |
| WhatsApp us | Open WhatsApp chat with the ES number and a pre-filled, localized message | `Linking.openURL` with a `wa.me` universal link; message from i18n, URL-encoded; falls back to the browser if WhatsApp is not installed |
| Hotline | Open the dialer with the number pre-filled | `Linking.openURL('tel:…')` |
| Email | Open the default mail app with the recipient pre-filled | `Linking.openURL('mailto:…')` |
| Back (nav bar) | Does nothing | No handler |

Booking URL, WhatsApp number, hotline and email come from the PRD and live in a single config module, never inline in components.

> **[ASSUMPTION]** The PRD contains two different pre-filled WhatsApp messages (the URL example vs the dedicated "WhatsApp Pre-filled Message" section). This spec uses the dedicated, localized section (§15, Q1).

---

## 5. Data model and data source

### 5.1 Model

```ts
interface Specialist {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Page<T> {
  items: T[];
  offset: number; // offset this page started at
  limit: number;  // requested page size
  total: number;  // total number of items in the source
}
```

`hasMore = offset + items.length < total`

The PRD overview mentions "clear titles" for specialists, but the Figma card shows only photo and name. The model follows Figma; a `title` field can be added when the CMS defines it.

### 5.2 Repository (swap point for Q2 CMS)

```ts
interface SpecialistRepository {
  getSpecialists(params: { offset: number; limit: number }): Promise<Page<Specialist>>;
}
```

| Implementation | Purpose |
|---|---|
| `HardcodedSpecialistRepository` | Current implementation (PRD: "Hardcode for now"). Reads from a local dataset, paginates in memory, simulates network latency. Supports injected failure for demos/tests |
| `CmsSpecialistRepository` | Stub for Q2. Same interface; not implemented beyond the signature |

- **Ordering is owned by the data source.** The PRD requires the CMS to allow adjusting the order, so the contract is: items are returned in display order. The UI never sorts.
- The repository is provided through a React context (`RepositoryProvider`) at the app root.
- **Swapping to CMS = changing one line** in the provider setup. UI and hooks depend only on the interface. (ADR-002)
- The interface is paginated (offset-based) from day one so both list modes and the future CMS share one contract.

### 5.3 Dataset

- Base list (from Figma): Kan Chung, Alisa Mak, Justin Liu
- Extended list: 100+ generated specialists for the infinite-scroll requirement
- Deterministic generation (stable IDs, fixed order) so tests are reproducible

---

## 6. Data fetching and list modes

Hooks live in the viewmodel layer and depend only on `SpecialistRepository`.

### 6.1 Plain mode

- `useQuery(['specialists', 'all'])`
- Fetches the full list in one request (repository called with a large `limit` or a dedicated "all" helper)
- Renders everything into the FlatList (rendering is still virtualized)

### 6.2 Infinite mode (senior)

- `useInfiniteQuery(['specialists', 'infinite'])`, offset pagination:
  - `initialPageParam: 0`
  - `getNextPageParam: (last) => last.offset + last.items.length < last.total ? last.offset + last.items.length : undefined`
- Page size: **20** **[ASSUMPTION]**
- `onEndReached` → `fetchNextPage()` only if `hasNextPage && !isFetchingNextPage` (prevents duplicate fetches)
- `onEndReachedThreshold` ≈ 0.5
- Flattened items are de-duplicated by `id`
- Footer shows a spinner while fetching the next page, or the inline error view with Retry if the next page fails
- Pull-to-refresh resets to the first page

### 6.3 Required comparison (explain in PR and be ready to discuss)

| | Plain | Infinite |
|---|---|---|
| Fetching | One request, all items | One request per page, triggered near the end of the list |
| Time to first content | Grows with list size | Constant (first page only) |
| Memory — data | O(n) | O(pages loaded × page size) |
| Memory — rendered views | Bounded by FlatList virtualization (window) | Same |
| Scrolling | Scrollbar length known up front | Scrollbar grows as pages load; footer loader appears |
| Failure modes | One request fails → whole list fails | First-page failure vs next-page failure handled separately |
| Extra concerns | — | Duplicate `onEndReached` calls, retry of a single page, refresh resetting pages |

Key point: **virtualization limits rendered views; pagination limits fetched data and network cost.** They solve different problems.

### 6.4 Offset vs cursor pagination (ADR-007)

Chosen: **offset**.

| | Offset | Cursor |
|---|---|---|
| Simplicity | Simple; maps directly to `LIMIT/OFFSET` and most CMS APIs | Needs a stable sort key and opaque cursor |
| Jump to page / show total | Easy (`total` is known) | Hard |
| Data changing while scrolling | Inserts/deletes/reordering shift items → duplicates or skipped items | Stable |
| Deep pages on large tables | Slower (database scans skipped rows) | Constant |

Mitigation for the shifting-data risk: de-duplicate items by `id` when flattening pages. Note that the PRD lets the CMS **reorder** specialists, which is exactly the case where offset can shift; for a list of a few hundred specialists edited occasionally, offset plus de-duplication is sufficient, and cursor is the upgrade path if the list becomes large or frequently changing.

### 6.5 UX trade-off to raise

In infinite mode, the contact info and agreements in the list footer are only reachable after every page is loaded. Proposed options (documented in ADR-006 and the PR):

1. Keep as is (simplest, matches design literally)
2. Show the first N specialists + "See all" leading to a dedicated infinite list screen
3. Move contact info into the bottom section

**[ASSUMPTION]** Implement option 1, document options 2–3 (§15, Q4).

---

## 7. Feature flag (senior)

```ts
type FeatureFlag = 'premiumConsultation';

interface FeatureFlagService {
  isEnabled(flag: FeatureFlag): boolean;
}
```

- Current implementation: local, in-memory flags with defaults from config; a dev toggle on Home updates them at runtime
- Future implementations (e.g. remote config) plug in behind the same interface (ADR-003)
- Exposed through a context + `useFeatureFlag(flag)` hook
- **Guarded in two places:**
  1. Entry button on Home (navigate vs. coming-soon dialog)
  2. The Consultation route itself, so a deep link cannot bypass the flag (shows coming-soon / redirects back)
- Demo: screen recording toggling the flag and pressing the button in both states

---

## 8. Dialog de-duplication (senior)

### Requirement

Pressing the entry button twice quickly (including programmatically in tests) must not open the "coming soon" dialog twice.

### Approach

- A central `DialogManager` (context + hook) owns which dialog is open.
- `show(id, content)` checks a **ref-based** registry of open dialog IDs **synchronously** and ignores the call if `id` is already open.
- The visible UI is driven by state, but the guard uses a ref.

### Why a ref, not state

Two presses can be handled before React re-renders. A `useState` check would read the same stale `false` in both handlers and open twice. A ref is updated immediately and is visible to the second call.

### Bonus: multiple buttons and multiple dialogs

- Dialogs are identified by ID; the same ID cannot be shown twice regardless of which button triggered it.
- Policy for different IDs: **one dialog at a time; later requests are queued** **[ASSUMPTION]**. Alternative policies (drop, replace) are documented.

### Test

- Render Home with the flag disabled, call `fireEvent.press` twice synchronously, assert exactly one dialog is rendered.

(ADR-004)

---

## 9. Localization

- Languages: **English (`en`)** and **Traditional Chinese, Hong Kong (`zh-HK`)** — the PRD's Chinese copy is written Cantonese, so it is `zh-HK`, not generic `zh-Hant`
- Default: device language via `expo-localization` (`zh-*` with Hong Kong / Traditional script → `zh-HK`), fallback `en`
- Runtime switch on Home (dev controls)
- **Every user-visible string** goes through i18n, including dialog text, error messages, button labels and accessibility labels
- Phone numbers and email are data, not translated
- The contact-info paragraph has a **different sentence structure per language** (EN: multi-line list; ZH: one sentence with the number and email inline). Use `<Trans>` with link components so each language controls its own word order while the hotline and email stay tappable
- Typography per language follows the Figma text styles (read via MCP, §11)
- **Copy comes from the PRD** (EN + ZH for every section); it is not duplicated here (§11a)
- The PRD has no Chinese copy for the error view and Retry button **[ASSUMPTION]**: the author translates them and lists them in the PR
- Copy not defined by the PRD (Home screen, coming-soon dialog, empty state, dev controls) is written by the author in both languages and listed in the PR

---

## 10. States

| State | Where | UI |
|---|---|---|
| Loading (first page) | List body | Skeleton cards (same size as SpecialistCard) |
| Error (first page) | List body | **Inline error view** (PRD): error text + **Retry button only** → refetch |
| Empty | List body | Short message **[ASSUMPTION]** (not specified by PRD) |
| Loading (next page) | List footer | Spinner |
| Error (next page) | List footer | Same inline error view; Retry → `fetchNextPage` |
| Refreshing | List | Pull-to-refresh indicator |

- PRD note: the reference screenshot shows a "Close" button; that is incorrect — **only Retry** is shown.
- The PRD error text says "close the app and try again" while the only action is Retry. Implemented as written; the mismatch is raised in §15, Q5.
- Header, footer content and the bottom section stay visible in every state. The hardcoded repository can be configured to fail so error states can be demonstrated.

---

## 11. Design source (Figma via MCP)

Visual details (colors, typography, spacing, radii, shadows, assets) are **not duplicated in this spec**. They are read from Figma through the Figma MCP server during implementation, so the design file stays the single source of truth.

- File: the author's copy of `Premium-consultation-UI` in their Figma account (edit access is required by the MCP server; the original shared file is view-only)
- Relevant frames: `Premium Consultation/Details` — a full-length frame (all content laid out) and a viewport-height frame (persistent bottom section over scrolling content)

### Procedure

1. Read the design variables (colors, fonts, effects) and generate `src/shared/theme.ts` from them; use semantic token names, not raw hex values in components
2. Read design context per component (SpecialistCard, bottom section, agreements box, header) and translate to React Native `View` / `Text` / `StyleSheet` — no HTML elements, no Tailwind
3. Export the hero image and icons as assets
4. Ignore hidden layers (leftover elements such as tags, timestamps and icons on the cards)
5. Copy comes from the PRD (§11a), not from Figma text layers; never inline strings
6. Bottom section uses a plain white background regardless of any glass/blur styling in Figma (PRD)

MCP calls are rate-limited on the author's plan: read variables once, then fetch design context only for the components being built.

## 11a. PRD source (zip)

> **TODO:** The PRD is provided as a zip (saved Confluence page) at implementation time. Read it before building screens, i18n and actions.

- The zip contains `Premium Consultation - Confluence.html` plus a `_files/` folder of Confluence scripts and a `__MACOSX/` folder — only the HTML holds content
- Extract the visible text from the HTML (strip scripts and styles); the PRD screenshots are not included in the zip, so visuals come from Figma
- Take from the PRD: section behaviour, EN/ZH copy, booking URL, WhatsApp number and pre-filled messages, hotline, email, error-view copy
- Copy goes into `locales/en.json` and `locales/zh-HK.json`; URLs and contact values go into the config module
- Keep the zip, the assignment PDF and any extracted HTML in `.private/` (git-ignored, see §14). Never commit them (company documents); reference the PRD in the PR as "provided separately" **[ASSUMPTION]**

---

## 12. Project structure

```
src/
  app/
    App.tsx                     providers: QueryClient, Repository, FeatureFlags, Dialog, i18n
    navigation.tsx
  features/
    home/
      view/HomeScreen.tsx
      viewmodel/useConsultationEntry.ts
    consultation/
      view/ConsultationScreen.tsx
      view/SpecialistCard.tsx
      view/ConsultationBottomSection.tsx
      view/ContactInfo.tsx
      view/states/              Skeleton, InlineErrorView, EmptyState
      viewmodel/useSpecialists.ts          plain
      viewmodel/useInfiniteSpecialists.ts  infinite
      viewmodel/useConsultationActions.ts  booking, WhatsApp, tel, mailto
  data/
    specialist/
      Specialist.ts
      SpecialistRepository.ts
      HardcodedSpecialistRepository.ts
      CmsSpecialistRepository.ts           stub
      specialists.fixture.ts
      RepositoryProvider.tsx
  shared/
    featureFlags/
    dialog/                     DialogManager
    i18n/                       setup + locales/en.json, zh-HK.json
    config/                     contact info, booking URL, flag defaults
    theme.ts
docs/
  adr/
  GLOSSARY.md
```

Layering: **View** (components, no logic) → **ViewModel** (custom hooks) → **Data** (repository interface). UI and hooks never import a concrete repository. Side-effecting actions (`Linking`, `WebBrowser`) are wrapped in `useConsultationActions` so they can be mocked in tests.

---

## 13. Testing strategy (TDD seams)

| Seam | Type | Cases |
|---|---|---|
| `HardcodedSpecialistRepository` | Unit | First page (`offset: 0`), next page by offset, last page (`offset + items.length === total`), offset beyond total returns empty items, order preserved, configured failure |
| `DialogManager` | Unit | Same ID twice → one dialog; different IDs → queued; close → next shown |
| `useConsultationEntry` | Hook | Flag on → navigate; flag off → dialog |
| Home screen | Component | Double press with flag off → exactly one dialog |
| `useInfiniteSpecialists` | Hook | Loads first page; `fetchNextPage` appends; no fetch when `!hasNextPage` or already fetching; duplicate IDs across pages are removed |
| `useConsultationActions` | Hook | Book → `openBrowserAsync` with booking URL; WhatsApp → `wa.me` URL with encoded message in the current language; hotline → `tel:`; email → `mailto:` |
| Consultation screen | Component | Loading skeleton; inline error with Retry only, Retry refetches; empty; list renders names; contact info and agreements present; back button has no effect |
| i18n | Component | Key strings render in both languages; contact links remain tappable in both languages |

Tests inject a fake `SpecialistRepository` and a fresh `QueryClient` per test (retries disabled). `Linking` and `expo-web-browser` are mocked.

---

## 14. Delivery

### Repository and PR

> **TODO — branching:** `main` ← `dev` ← `feats/T-XXXX-[TicketName]`
> - `main`: initial commit with `README.md` only (no code). `.gitignore`, `CLAUDE.md` and this spec land through ticket `T-0001` (ADR-008)
> - `dev`: branched from `main`; integration branch
> - `feats/T-XXXX-[TicketName]`: one branch per ticket, merged into `dev` via PR. `XXXX` is an auto-incrementing, zero-padded 4-digit sequence number (`T-0001`, `T-0002`, …), assigned in ticket order and never reused (e.g. `feats/T-0003-SpecialistRepository`)
> - Submission: PR `dev` → `main`, reviewed by the interviewer **[ASSUMPTION]**
> - Small Conventional Commits; respond to review with new commits (no force-push during review)

### .gitignore

> Created in `T-0001` (before scaffolding, ADR-008); merge the Expo template's entries when scaffolding in `T-0002`. It must exclude `.private/` (PRD zip, assignment PDF, extracted PRD), `__MACOSX/`, secrets and generated native folders, and must **not** exclude `package-lock.json`.

### CI (GitHub Actions on pull_request)

`npm ci` → `tsc --noEmit` → `npm run lint` → `npm test`, Node version from `.nvmrc`.

### README

Setup (Node version, `npm ci`, `npx expo start`), architecture overview, how to swap to CMS, how to toggle the feature flag, list mode and simulated failure, how to run tests.

### PR description

Summary · Demo (screenshots + videos: feature flag on/off, double-press, infinite scroll, language switch, error + retry, booking and WhatsApp redirects) · How to run · Architecture · Requirements checklist (brief + PRD) · Senior answers (§6.3, §7, §8) · Trade-offs and assumptions · Future work (CMS, remote flags)

### Pre-submit checklist

- [ ] Fresh clone of the PR branch builds and runs following README only
- [ ] `git status` / `git ls-files` show no `.private/`, `.env`, `__MACOSX/` or generated native folders
- [ ] `npx expo-doctor` passes
- [ ] CI green
- [ ] Every assumption is listed in the PR

---

## 14a. Agent workflow (`/to-tickets`, `/implement`)

> **Instructions for Claude Code.** Follow these rules automatically when breaking this spec into tickets and implementing them.
>
> **CLAUDE.md:** `CLAUDE.md` at the repo root (added in `T-0001`, ADR-008) contains at least:
> `Follow the workflow in docs/SPEC.md §14a for every ticket, branch, commit and PR.`
> so every Claude Code session applies these rules without re-reading this spec first.

### `/to-tickets`

- Source: this spec (`docs/SPEC.md`). Do not run `/to-spec`; this file is the single spec.
- Ticket ID: `T-XXXX`, an auto-incrementing, zero-padded 4-digit number starting at `T-0001`, assigned in implementation order and never reused.
- Ticket name: short PascalCase, used in the branch name (e.g. `T-0003 SpecialistRepository`).
- Each ticket lists: the spec sections it covers, its acceptance criteria (from §16), its TDD seams (from §13), and the tickets it is blocked by.
- One ticket = one branch = one PR. Keep tickets small enough to review in one sitting.
- `T-0001 RepoBootstrap` adds `.gitignore`, `CLAUDE.md`, the agent skills config and this spec (ADR-008). The next ticket, `T-0002`, covers project scaffolding (Expo, TypeScript, lint, test, CI, `.nvmrc`, merging the `.gitignore`); the last ticket covers README, final docs and the `dev` → `main` PR description.

### `/implement` — per ticket

1. Start from an up-to-date `dev`:
   `git checkout dev && git pull && git checkout -b feats/T-XXXX-[TicketName]`
2. Do not start a ticket until every ticket it is blocked by has been merged into `dev`.
3. Implement only this ticket's scope; use `/tdd` at the seams listed in the ticket.
4. Before each commit: `npx tsc --noEmit`, lint, and the relevant test files. Before opening the PR: the full test suite.
5. Commit with Conventional Commits, referencing the ticket (e.g. `feat(T-0003): add offset pagination to repository`).
6. Push the branch and open a PR **into `dev`** titled `T-XXXX: [TicketName]`. PR body: summary, spec sections covered, acceptance criteria checklist, tests added, screenshots/video for UI changes, decisions (link ADRs).
7. Stop and wait for the author to review and merge. **Do not merge PRs yourself.**

### Always

- Never commit directly to `main` or `dev`; never force-push a branch that has an open PR.
- Never commit anything from `.private/` or secrets.
- New or changed decisions → write an ADR in `docs/adr/` and update this spec in the same PR.
- If the spec is ambiguous, stop and ask the author instead of guessing; record the answer as an ADR or an [ASSUMPTION].
- Remind the author to export the conversation (`/export`) at the end of each session.

### Final submission

When all tickets are merged into `dev`: open the PR `dev` → `main` using the PR description outline in §14, after completing the pre-submit checklist.

---

## 15. Open questions (to confirm with interviewer)

1. **WhatsApp pre-filled message:** the PRD URL example differs from the dedicated "WhatsApp Pre-filled Message" section. Which one? (Assumed the dedicated, localized one.)
2. **Entry point:** the brief says the Figma screen is the entry point; the senior section requires a button entry. Is adding a Home screen acceptable?
3. **Back button:** the PRD says it does nothing. With a Home screen in front, is leaving via the native back gesture acceptable?
4. **Infinite scroll footer:** how should contact info and agreements be handled when the list is paginated?
5. **Error copy:** the error text says "close the app and try again" but the only action is Retry. Keep as written? Is there official Chinese copy for the error and the Retry button?
6. **Navigation library:** any preference between React Navigation and Expo Router?
7. **Review target:** should the interviewer review the single `dev` → `main` PR, or the per-ticket PRs into `dev`?

---

## 16. Acceptance criteria

- [ ] Consultation screen matches Figma visuals and PRD behaviour
- [ ] Persistent white bottom section with service hours and two black buttons, built with `@gorhom/bottom-sheet`
- [ ] Book appointment opens the booking site in an in-app browser with an option to open externally
- [ ] WhatsApp us opens a chat with the PRD's ES number and a localized pre-filled message
- [ ] Hotline opens the dialer pre-filled; email opens the mail app with the recipient pre-filled
- [ ] Back button is rendered and does nothing
- [ ] Specialist list is static (no interaction) and rendered in data-source order
- [ ] Specialist data loaded through TanStack Query via `SpecialistRepository`
- [ ] Loading, inline error with Retry only, and empty states for first page and next page
- [ ] All visible text localized in English and Chinese (Hong Kong) using PRD copy, switchable at runtime
- [ ] Swapping hardcoded data for CMS requires changing only the provider setup
- [ ] Feature flag gates entry from Home and the route itself; coming-soon dialog when disabled
- [ ] Rapid double press opens the dialog once, covered by a test
- [ ] Infinite scroll over 100+ specialists without duplicate page fetches
- [ ] Plain vs infinite comparison documented
- [ ] Reproducible build, CI green, PR submitted with demo videos
