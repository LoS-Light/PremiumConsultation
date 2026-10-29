# Premium Consultation — Specification

> Take-home assignment: React Native (Expo + TypeScript).
> Status: refined in T-0002 (`/grill-with-docs`). No open assumptions; decisions are recorded in this spec and, where they pass the three-part test (§14a), as ADRs in `docs/adr/`.

---

## 1. Overview

Build the **Premium Consultation** screen of the GUM app. The screen introduces the ES team's Specialists (see `GLOSSARY.md`), lists them, and offers two actions — **Book appointment** and **WhatsApp us** — in a persistent bottom section. The goal (per PRD) is a clear, approachable contact section similar to Bowtie's consultation UI, and pre-filled WhatsApp messages so the ES team can identify and prioritise app users.

The work is submitted as a **pull request** against an empty repository and reviewed by the interviewer. AI-written code is allowed, but every design decision must be explainable by the author. Decisions are recorded as ADRs in `docs/adr/`.

### Sources

| Source | Notes |
|---|---|
| Assignment brief | Epic ticket (PDF) — technical requirements and senior tasks |
| PRD | Confluence "Premium Consultation", provided as a PDF capture — behaviour, copy, URLs and contact values. Read through its transcription (see §11a) |
| Figma | Visual design; read via Figma MCP during implementation (see §11) |

When the PRD and Figma disagree on **behaviour or copy**, the PRD wins. Figma is the source for **visuals**.

---

## 2. Goals and non-goals

### Goals

Delivered in two releases (ADR-011):

- **v1.0.0 — general requirements:** everything below except the senior bullet. The Consultation screen is the app's entry point.
- **v1.1.0 — senior requirements:** Home entry button, feature flag, de-duplicated dialog, infinite scroll. Also error handling, moved from v1.0.0 (ADR-011).
- **v1.1.1 — docs only:** the v1.1.0 app, unchanged, with the demo screenshots and video and a quick start in the README, so `main` shows them (§14).
- **v1.1.2 — docs only:** the same app; the README explains the expected `npm audit` and Reanimated warnings before the quick start and in its known limitations.

- Consultation screen matching the Figma design and PRD behaviour
- Data loading via TanStack Query, with loading and empty states (error state in v1.1.0)
- Persistent bottom section via `@gorhom/bottom-sheet`
- Localization: English and Traditional Chinese (Hong Kong), copy from the PRD
- Specialist data source behind an abstraction so the hardcoded list can be swapped for a CMS (planned for Q2) without touching UI or hooks
- **Senior (v1.1.0):** Home entry button, feature flag gating the screen, de-duplicated "coming soon" dialog, infinite-scroll specialist list
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
| Navigation | v1.0.0: none. v1.1.0: React Navigation (JS stack, iOS transitions on both platforms, ADR-013) | v1.0.0 has a single screen, and its top bar is Figma's custom nav bar, not a navigator header. v1.1.0 adds Home → Consultation and back; two screens are explicit and easy to explain with a stack, without Expo Router's file-based conventions. The JS stack (not the native stack) gives Android the same push, pop and swipe back as iOS (ADR-013) |
| Data fetching | TanStack Query (`useQuery`, `useInfiniteQuery`) | Required by the brief; built-in loading/error/retry/pagination |
| Bottom sheet | `@gorhom/bottom-sheet` (+ `react-native-reanimated`, `react-native-gesture-handler`) | Required by the brief |
| In-app browser | `expo-web-browser` | PRD: booking opens in an in-app browser that offers "open in external browser" |
| External links | `Linking` (React Native) | `tel:`, `mailto:`, WhatsApp universal link |
| i18n | `i18next`, `react-i18next`, `expo-localization` | Device-language detection, `<Trans>` for inline links |
| Fonts | `expo-font` / `@expo-google-fonts` (families per Figma) | Match Figma typography |
| Testing | Jest (`jest-expo`), React Native Testing Library | Standard for Expo |
| Lint/format | ESLint, Prettier | |
| Node | Pinned in `.nvmrc` and `package.json#engines` | Reproducibility |

---

## 4. Screens

### 4.1 Home (entry point, v1.1.0) — not in Figma / PRD

Minimal screen that exists to satisfy the senior requirement. It does not exist in v1.0.0. It reuses the Consultation hero (image and gradient) at the top, on the hero's background colour (LY2) so the gradient fades into the screen, with four buttons at the bottom, from the top: the entry button, the feature toggles' button, the dialog demo's button and the toast demo's button, the last one placed like the Consultation screen's last button (on Android both sit 10 dp higher, §4.2).

- **Entry button:** **"Premium consultation"** / **「尊尚諮詢」** (`home.premiumConsultation`), behind the feature flag `premiumConsultation`:
  - **enabled** → navigate to `ConsultationScreen`
  - **disabled** → show the "Coming soon" dialog (see §8)
- **Dialog demo entry:** the third button, **"Test multiple dialogs"** / **「測試多個對話框」** (`home.testMultipleDialogs`), not behind the flag. It opens the **Dialog demo** screen: Home's background, the back nav bar, and three buttons at the bottom that demo the brief's bonus question (§8): **"One dialog"** / 「一個對話框」, **"Press two buttons, same dialog"** / 「觸發兩個按鈕，同一個對話框」 and **"Three dialogs at once"** / 「同時三個對話框」. Its copy (`dialogDemo.*`) is written by the author; the test dialogs read "Dialog A" / 「對話框 A」, "Test dialog A (ID: demoA)." / 「測試對話框 A（ID：demoA）。」 and "OK" / 「知道了」 (likewise B and C)
- **Toast demo entry:** the bottom button, **"Test toasts"** / **「測試連發 Toast」** (`home.testToasts`), not behind the flag. It opens the **Toast demo** screen (Home's background, the back nav bar) with three buttons, **"Toast A"**, **"Toast B"** and **"Toast C"**, that demo the press throttle (§8a, layer 1). Every press that gets through shows a toast at once, "Toast A (press 3)" / 「Toast A（第 3 次）」, counting the toasts shown; there is no queue or de-duplication. Toasts are dark rounded labels that stack above the buttons, newest at the bottom, each fading in, staying 2 s and fading out, the same on both platforms (no native Toast). With the throttle on, presses within 500 ms make no toast; with it off, every press does
- **Feature toggles:** the second button, **"Feature Toggle"** / **「功能開關」** (`home.featureToggle`), shown in every build (it is a demo app, and the README tells reviewers about it). It opens a `BottomSheetModal` (`@gorhom/bottom-sheet`, no new dependency) titled **"Feature toggles"** / **「功能開關」**, sized to its content and closed by dragging it down or tapping outside it. Each switch is an iOS-style `ToggleSwitch` on both platforms, with a one-line description below it. The values live in memory only (no persistence; an app restart resets them). All its copy is localized (`featureToggles.*`) and written by the author:
  - **Enable Premium consultation** / **「啟用尊尚諮詢」** (feature flag): default **on**; turns `premiumConsultation` on or off (§7). On by default so the entry button works straight away; switch it off to demo the coming-soon dialog. Description: "Off: the entry button shows a coming-soon dialog." / 「關閉時，入口按鈕會顯示「即將推出」對話框。」 Below it, a muted tip that this is a demo shortcut, not the recommended practice, which is Firebase Remote Config or the CMS: "Tip: this switch is a quick way to enable or disable the Premium consultation screen for the demo, not the recommended practice. In production, control whether the screen is enabled with the CMS, Firebase Remote Config or similar." / 「提示：這個開關只是在 demo 中快速模擬啟用／停用尊尚諮詢頁面，並非最佳實務。正式環境應透過 CMS 或 Firebase Remote Config 等方式控管頁面是否啟用。」
  - **Enable dialog de-duplication** / **「啟用對話框去重」** (`dialogDeduplication`): default **on**. Off, a dialog asked for while it is already showing or queued shows again (§8). Description: "Off: a dialog asked for while it is already showing or waiting shows again." / 「關閉時，同一個對話框正在顯示或排隊時再次觸發，會再出現一次。」
  - **Enable dialog queue** / **「啟用對話框排隊」** (`dialogQueue`): default **on**. Off, dialogs no longer wait their turn and stack at once (§8). Description: "Off: dialogs no longer wait their turn; they stack on top of each other." / 「關閉時，對話框不再依序出現，而是疊在一起。」
  - **Enable press throttle** / **「啟用按鈕節流」** (`pressThrottle`): default **on**; switches layer 1 of the duplicate-press protection off (§8a), to show that `navigate()` and the dialog queue stop a double press alone. Description: "Off: buttons react to every press, so a quick double press is stopped only by navigate() and the dialog queue." / 「關閉時，按鈕每次點擊都會反應，快速連點只靠 navigate() 和對話框佇列擋下。」
  - **Simulate loading failure** / **「模擬載入失敗」** (`simulateLoadingFailure`): default **off**; on, every Specialist request fails with probability 0.3, to show the error view and Retry (§10). Description: "On: each Specialist load fails {{percent}}% of the time, to show the error view and Retry." / 「開啟時，每次載入專家有 {{percent}}% 機率失敗，用來展示錯誤畫面和重試。」, with the percentage taken from the config rate

The brief's general requirements make the Figma screen the entry point, while the senior section asks for a button-based entry. Both are met in turn (ADR-011): in **v1.0.0** the app opens straight on the Consultation screen; **v1.1.0** adds Home in front of it, because the flag gating, the coming-soon dialog and the double-press guard all need a button to press and to demo. The Figma screen stays the feature's main screen; Home only hosts the entry button, the feature toggles and the dialog and toast demos.

### 4.2 Consultation screen

One screen, `ConsultationScreen`, written once.

- **v1.0.0:** plain list, loaded in one request with `useSpecialists` (§6.1).
- **v1.1.0:** infinite scroll with `useInfiniteSpecialistsQuery` (§6.2), which **replaces** the plain list; there is no mode switch. Layout, cards and sections are unchanged; the list footer adds the next-page spinner and next-page error.
- The two behaviours are compared by checking out the `v1.0.0` and `v1.1.0` tags; the README shows the screenshots and both releases' demo videos (§6.3, §14).

Structure (ADR-012, superseding ADR-005):

```
ConsultationScreen
├─ Hero photo banner — fixed background, does not scroll
├─ Fixed nav bar with back icon — does nothing in v1.0.0 (PRD); returns to Home in v1.1.0
└─ BottomSheet (white, top corners radius 32)
    ├─ Snap points: collapsed (top at Figma y = 230 pt, scaled to the screen width)
    │               expanded (top just below the nav bar, so the back arrow stays visible)
    ├─ BottomSheetFlatList (single virtualized list)
    │   ├─ ListHeaderComponent: overline, title + divider, description
    │   ├─ data → SpecialistCard × N
    │   ├─ ListEmptyComponent → loading skeleton / empty (first page); inline error from v1.1.0
    │   └─ ListFooterComponent: next-page indicator/error (v1.1.0), contact info, agreements notice
    │   └─ Bottom padding equal to the footer height
    └─ footerComponent: persistent bottom section (service hours, two buttons)
```

**Sheet behaviour:** it appears already collapsed, with no opening animation, and can only grow: it never rests below the collapsed point and cannot be closed. Pulling down at the collapsed point stretches the sheet a little with resistance and springs it back (gorhom's over-drag). Once a drag starts with the list scrolled, it only scrolls the list; collapsing needs a new drag (gorhom's design). Dragging moves the sheet until it is expanded; after that the list scrolls (gorhom's built-in hand-off). Pulling past the end of the list bounces on iOS and stretches on Android (the platform's native overscroll; gorhom turns Android's off by default, so the list turns it back on). The sheet and the bottom section only claim vertical drags, so a swipe back from the left edge works over them too (ADR-013). Snap points are computed from the full screen frame, not the window, because Android's window size leaves out the status and navigation bars. Every bottom sheet (this one and the Feature toggles sheet, §4.1) opens and snaps with the library's iOS spring on both platforms; the library's own default is a 250 ms timing on Android, which moved at a different pace. The content sheet uses an instant animation until the screen's push transition ends (or 1 s passes, when the app opened on this screen; a drag in that first second snaps without animation): with `animateOnMount` off, the library still snaps to the initial index on mount, and from the second visit on that snap was animated, sliding the sheet up from the bottom. The bottom section keeps at least Figma's 34 pt home-indicator area below its content (more when the system's bottom inset is larger), so it looks the same on Android, whose gesture bar is shorter. On Android, the bottom controls of both screens (this section and Home's button) sit a further 10 dp higher, the author's visual choice.

**Back button:**

- **v1.0.0:** rendered for visual fidelity with no action, as the PRD says ("Clicking it does nothing"). There is no screen behind it; the Android back button leaves the app as usual.
- **v1.1.0:** Home sits in front of this screen, so `<` returns to Home, as do the swipe back from the left edge (on both platforms, ADR-013) and the Android back button. This deliberately departs from the PRD, because v1.1.0 adds a screen to return to.

### 4.3 SpecialistCard

- Card with rounded corners and drop shadow; photo and name (visual details from Figma)
- **Static, no interaction** (PRD)
- Placeholder image when `avatarUrl` is missing
- Hidden layers in Figma (tags, timestamps, icons) are leftovers and **not implemented**

### 4.4 Bottom section

- The bottom sheet's `footerComponent` (ADR-012): persists at the bottom of the screen whether the sheet is collapsed or expanded (PRD)
- White background; no liquid-glass / blur effect (PRD)
- Respects the bottom safe-area inset
- Service hours copy comes from the PRD ("Monday – Friday"), not the Figma text layer ("Monday- Friday"); both lines use the same Body 3 weight as Figma, although the PRD shows the Chinese heading in bold
- Shadow: Figma's drop shadow 8 8 15 rgba(0, 0, 0, 0.08), drawn on iOS with shadowRadius 7.5 (half of Figma's CSS-style blur, the rule used for every shadow) and elevation on Android

### 4.5 Actions

| Element | Behaviour (see PRD) | Implementation |
|---|---|---|
| Book appointment | Open the booking platform in an **in-app browser** that lets the user open it externally | `WebBrowser.openBrowserAsync(BOOKING_URL)` — SFSafariViewController (iOS) / Chrome Custom Tabs (Android) both provide a built-in "open in browser" control |
| WhatsApp us | Open WhatsApp chat with the ES number and a pre-filled, localized message | `Linking.openURL` with a `wa.me` universal link; message from i18n, URL-encoded; falls back to the browser if WhatsApp is not installed |
| Hotline | Open the dialer with the number pre-filled | `Linking.openURL('tel:…')` |
| Email | Open the default mail app with the recipient pre-filled | `Linking.openURL('mailto:…')` |
| Back (nav bar) | v1.0.0: does nothing (PRD). v1.1.0: returns to Home | v1.0.0: no handler. v1.1.0: `navigation.goBack()`, ignored once the screen is no longer focused (§8a). Accessibility label "Back" / 「返回」 (`navBar.back`, shared by every screen with a back button) |

Booking URL, WhatsApp number, hotline and email come from the PRD and live in a single config module, never inline in components.

If the device cannot open a link (no app handles it: for example, the iOS simulator has no Phone or Mail app, or the user deleted Mail), the action catches the failure and the user stays on the screen with nothing shown. A message for this case would need copy the PRD doesn't have.

> The PRD contains two different pre-filled WhatsApp messages. The "Universal link URL Format" example carries "Hi GUM Specialist! I am contacting via the app." (English only); the dedicated "Whatsapp Pre-filled Message" section gives localized EN/ZH text and matches the PRD screenshot. This spec uses the **dedicated section's message in the current language**, and takes only the URL **format** from the example: `https://wa.me/85260300900?text=<URL-encoded message>`. Trade-off: the dedicated message does not say it comes from the app, which the PRD overview lists as a goal.

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
| `HardcodedSpecialistRepository` | Current implementation (PRD: "Hardcode for now"). Reads from a local dataset, paginates in memory, simulates network latency. From v1.1.0, it can simulate failures for the demo (§10) |
| `CmsSpecialistRepository` | Stub for Q2. Same interface; not implemented beyond the signature |

- **Ordering is owned by the data source.** The PRD requires the CMS to allow adjusting the order, so the contract is: items are returned in display order. The UI never sorts.
- The repository is provided through a React context (`RepositoryProvider`) at the app root.
- **Swapping to CMS = changing one line** in the provider setup. UI and hooks depend only on the interface. (ADR-002)
- The interface is paginated (offset-based) **from v1.0.0**, even though v1.0.0 only asks for every item at once, so both list modes and the future CMS share one contract and v1.1.0 adds no new interface.
- **"Hardcoded" means the data source, not a shortcut.** In every release, screens read Specialists only through `SpecialistRepository` and TanStack Query (`useQuery` / `useInfiniteQuery`), with a loading state. No screen imports the dataset directly. This is what the brief's "use react-query for loading" and "swapping implementation is easy" require.

### 5.3 Dataset

- **Base list** (from Figma): Kan Chung, Alisa Mak, Justin Liu. Used by v1.0.0
- **Extended list** (v1.1.0): the base list followed by **100 generated Specialists, 103 in total**, matching the brief's "added 100+ specialists". Generated IDs `specialist-004` to `specialist-103`; names built from a fixed set of English first and last names; no `avatarUrl`, so the placeholder image shows
- Deterministic generation (stable IDs, fixed order) so tests are reproducible

---

## 6. Data fetching and list modes

Hooks live in the viewmodel layer and depend only on `SpecialistRepository`.

**Automatic retries are off (temporary).** The app's `QueryClient` sets `retry: false`. TanStack Query otherwise retries a failed request 3 times in the background before showing an error, so with the 30% simulated failure rate (§10) the error view would appear about 0.8% of the time, after several seconds of waiting. The PRD wants a failure to show the error view and let the user press Retry. **This is only for the current hardcoded data. When the app calls a real API (the Q2 CMS), restore automatic retries** (e.g. the default, or a small count with backoff) and keep Retry for failures that remain. The `QueryClient` setup carries a comment saying the same.

### 6.1 Plain mode (v1.0.0)

- `useQuery(['specialists', 'all'])`
- Fetches the full list in one request (repository called with a large `limit` or a dedicated "all" helper)
- Renders everything into the FlatList (rendering is still virtualized)
- Data: the base list of 3 Specialists
- Replaced by infinite mode in v1.1.0

### 6.2 Infinite mode (senior, v1.1.0)

- `useInfiniteQuery(['specialists', 'infinite'])`, offset pagination:
  - `initialPageParam: 0`
  - `getNextPageParam: (last) => last.offset + last.items.length < last.total ? last.offset + last.items.length : undefined`
- Page size: **10** (a config value). 103 Specialists load in 11 pages, so loading, failure and Retry come up often during the demo
- `onEndReached` → `fetchNextPage({ cancelRefetch: false })` only if `hasNextPage && !isFetchingNextPage` and the last next page didn't fail (prevents duplicate fetches; after a failure, onEndReached fires again when the spinner's space goes, and only Retry, §10, loads the failed page again). `cancelRefetch: false` covers a second call in the same tick, before `isFetchingNextPage` updates: TanStack Query's default would cancel the request in flight and start it again
- `onEndReachedThreshold` 0.2: the next page starts loading when a fifth of a screen of list is left, so the footer spinner is reached and seen. The hardcoded repository's simulated latency is 1500 ms (a config value) for the same reason; it applies to every request, so the first-page skeleton also shows for 1.5 s
- Flattened items are de-duplicated by `id`, keeping the first
- Tests hold the next page back to see the footer spinner.
- Leaving the screen removes the query, so entering again starts from the first page (with the skeleton) instead of TanStack Query reloading every cached page one after another in the background (11 × 1.5 s at worst, and any failure turning the shown list into an error)
- The list virtualizes its rows, so screen tests check the requests and the spinner rather than counting rendered rows
- Footer shows a spinner while fetching the next page, or the inline error view with Retry if the next page fails

### 6.3 Required comparison (explain in PR and be ready to discuss)

| | Plain | Infinite |
|---|---|---|
| Fetching | One request, all items | One request per page, triggered near the end of the list |
| Time to first content | Grows with list size | Constant (first page only) |
| Memory — data | O(n) | O(pages loaded × page size) |
| Memory — rendered views | Bounded by FlatList virtualization (window) | Same |
| Scrolling | Scrollbar length known up front | Scrollbar grows as pages load; footer loader appears |
| Failure modes | One request fails → whole list fails | First-page failure vs next-page failure handled separately |
| Extra concerns | — | Duplicate `onEndReached` calls, retry of a single page |

Key point: **virtualization limits rendered views; pagination limits fetched data and network cost.** They solve different problems.

The table compares both approaches for the same list size *n*. In the app they live in different releases: check out `v1.0.0` for the plain list (3 Specialists) and `v1.1.0` for infinite scroll (103 Specialists). The README compares them in a table, and the PR explains the differences.

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

In infinite mode, the contact info and agreements in the list footer are only reachable after every page is loaded (103 Specialists at 10 per page is 11 pages). Options considered:

1. Keep as is (simplest, matches the design literally)
2. Show the first N Specialists + "See all" leading to a dedicated infinite list screen
3. Move contact info into the bottom section

**Decision: option 1.** It matches Figma and is the simplest; options 2–3 are described in the PR as the trade-off. Easy to change later, so no ADR.

---

## 7. Feature flag (senior)

```ts
type FeatureFlag =
  | 'premiumConsultation'
  | 'pressThrottle' // §8a, layer 1
  | 'dialogDeduplication' // §8, the DialogManager's rules
  | 'dialogQueue'
  | 'simulateLoadingFailure'; // §10

interface FeatureFlagService {
  isEnabled(flag: FeatureFlag): boolean;
  subscribe(onChange: () => void): () => void; // re-render when a flag changes
}

// The demo's in-memory service can also be switched at runtime.
interface SwitchableFeatureFlagService extends FeatureFlagService {
  setEnabled(flag: FeatureFlag, isEnabled: boolean): void;
}
```

- Current implementation: `LocalFeatureFlagService`, in-memory flags with defaults from config, switched at runtime from the Feature toggles sheet on Home (§4.1). The app's instance is created in one statement (`src/app/services.ts`); swapping to a remote source changes only that statement
- **This is a demo shortcut, not the recommended production approach.** In production the flag should come from a remote source the business controls without an app release: **Firebase Remote Config**, or the **CMS** back office planned for Q2. Either plugs in as another `FeatureFlagService` implementation, with a safe default (off) when the remote value is unavailable; UI and hooks do not change. The README says so
- Exposed through a context (`FeatureFlagProvider`) + `useFeatureFlag(flag)` hook, which re-renders on change (`useSyncExternalStore`)
- **Guarded in two places:**
  1. The entry button on Home (navigate vs. coming-soon dialog)
  2. The `Consultation` route itself, so a deep link cannot bypass the flag: while the flag is off the screen loads nothing, shows the coming-soon dialog and goes back (or resets to Home when there is nothing to go back to)
- Demo: screen recording switching the flag in the Feature toggles sheet and pressing the entry button in both states

---

## 8. Dialog de-duplication (senior)

### Requirement

Pressing the entry button twice quickly (including programmatically in tests) must not open the "coming soon" dialog twice.

### Coming-soon dialog

A custom, centred dialog component, not the native `Alert.alert`: `DialogManager` must control showing and queueing, and native alerts behave differently on iOS and Android. It dims the screen behind it and blocks it until its button is pressed (the brief's dialog: one that has to be dismissed, which is what makes showing it twice a problem); the Android back button also closes it. Not in Figma or the PRD; copy:

| | English | Chinese (`zh-HK`) |
|---|---|---|
| Title | Coming soon | 即將推出 |
| Body | Premium consultation will be available soon. | 尊尚諮詢服務即將推出，敬請期待。 |
| Button | OK | 知道了 |

The button uses the black primary button style.

### Approach

- A central `DialogManager` (`DialogProvider` + `useDialog`) owns which dialog is open.
- Its guard is the **queue** (`dialogQueue`): a plain array created once per provider and read and written **synchronously**, like a ref. `show(id, content)` ignores the call if `id` is already showing or queued, and otherwise queues it, showing it at once if nothing else is.
- `close(id)` closes that dialog only if it is the one on screen, so a second close (the Android back button and the dialog's button together) can't drop the next dialog.
- The visible UI is driven by state (the dialog on screen), but the guard is the queue.

### Why a ref, not state

Two presses can be handled before React re-renders. A `useState` check would read the same stale `false` in both handlers and open twice. The queue, like a ref, is updated immediately and is visible to the second call.

### Bonus: multiple buttons and multiple dialogs

The bonus question is answered in the PR and README, proven by the `DialogManager` and Dialog demo tests (§13), and shown on the **Dialog demo** screen (§4.1). A dialog blocks the screen, so requests that would come from several buttons or events at the same moment are sent in the same tick:

| Button | Requests | Shown |
|---|---|---|
| One dialog (pressed twice quickly) | A, A | A once |
| Press two buttons, same dialog | A, A (from two entry points) | A once |
| Three dialogs at once | A, B, C (from three features) | A, then B, then C as each closes |

Switching the DialogManager's rules off in the Feature toggles sheet shows what each one prevents (the press throttle doesn't matter here: each button sends its requests in the same tick):

| De-duplication | Queue | Press two buttons, same dialog | Three dialogs at once |
|---|---|---|---|
| on | on | A once | A, then B, then C |
| off | on | A, then A again | A, then B, then C |
| on | off | A once | A, B and C stacked |
| off | off | two A stacked: the brief's "over-shown" dialog | A, B and C stacked |

Stacked dialogs show at once on one dimmed backdrop, each older one peeking out above the next; only the top one can be pressed, and closing it reveals the one below.

- Dialogs are identified by ID; the same ID cannot be shown twice regardless of which button triggered it.
- Policy, decided by state rather than time:
  - **Same ID** already showing or already queued → the request is ignored. Once that dialog has closed, the same ID is a new request again.
  - **Different ID** while another dialog is showing → queued; shown when the current one closes.
  - Otherwise → shown immediately.
- Considered and rejected: a time-based throttle as the dialog's guarantee (buttons do have a throttle, §8a, but only against hand jitter). It would let a duplicate through once the window passes while the dialog is still open, and block a legitimate press right after the dialog closes. Dropping or replacing on a different ID were also rejected: they lose or cut short a message.

### Test

- `DialogManager` on its own (§13): `show` twice with the same ID → one dialog; the same ID while queued → ignored; different IDs → queued; the same ID after it closed → shown again; a second close of a closed dialog → the next one stays. With its rules switched off: without de-duplication, the same ID twice → shown twice; without the queue, different IDs → stacked; a stacked dialog closed twice → the one below with the same ID stays; the queue switched while dialogs wait → they still close.
- Dialog demo screen (§13): the three buttons in the Bonus table, pressed past the button throttle, and with both rules switched off.
- Integration (Home screen, §13): with the flag disabled, press the entry button twice, moving the clock past the button throttle (§8a) in between so the second press reaches the `DialogManager`; then close the dialog and assert no second one follows (a duplicate would wait in the queue). Without the throttle pass, the throttle alone would stop the second press and the test couldn't show the dialog guard works.

---

## 8a. Duplicate-press protection (all releases)

Protection against repeated presses is layered. Each layer has one job and is tested on its own (§13):

| Layer | Guards against | Decided by | Scope | Release |
|---|---|---|---|---|
| 1. Button throttle | Hand jitter, rapid double taps | Time: leading edge, then presses within **500 ms** are ignored (300 ms in v1.0.0) | Every pressable | v1.0.0 |
| 2. `navigate()` de-duplication (React Navigation) | Stacking the same screen | State: a screen already in the stack is gone to, not pushed again | Every navigation to a screen | v1.1.0 |
| 3. Dialog de-duplication | The same dialog opening twice | State: same ID showing or queued (§8) | Every dialog | v1.1.0 |

- **Layer 1, `ThrottledPressable`.** A shared press component; the first press fires immediately and further presses within 500 ms (a config value; 300 ms in v1.0.0, raised in v1.1.0 so the Toast demo shows the throttle clearly) are ignored. Every pressable in the app uses it: primary buttons, the back button, the feature toggles' switch, Retry. The hotline and email links are `Text` inside `<Trans>` (§9), so they use the same throttle through its `useThrottledPress` hook. Never use `Pressable` or `TouchableOpacity` directly (§14a).
- **Layer 2, React Navigation's `navigate()`.** Screens are opened with `navigation.navigate(name)`, never `push`. When a screen of that name is already in the stack, `navigate()` goes to it instead of pushing it again, so a double press can't stack the Consultation screen even with layer 1 switched off. No app-level guard is needed (unlike Flutter's `Navigator.push`, which always pushes): a `guardedNavigate` with an in-flight ref was built in T-0009 and removed in T-0011 as redundant. Opening a screen with `push`, or the same screen with different params, would need a guard again.
- **Back.** `goBack()` has no such de-duplication, and a second press can still reach the back button while its screen is leaving (it depends on timing: without a check, a test with the press throttle off failed in about one full-suite run in ten). It would then go back from a screen that is gone, a dev-mode "GO_BACK was not handled" error. So the back button ignores a press once its screen is no longer focused. The Consultation route's flag gate (§7) goes back, or resets the stack to Home when there is nothing to go back to.
- **Demo.** The Feature toggles sheet (§4.1) can switch layer 1 off (`pressThrottle`), to show that layers 2 and 3 stop a double press on their own, and switch layer 3's rules off (`dialogDeduplication`, `dialogQueue`, §8) to show the problem they solve. Layer 1 alone is shown on the Toast demo screen, whose toasts have no other protection. A hand can't double-press a dialog's button, since the dialog covers the screen within a frame; that is why the brief's double press is done programmatically (in tests and on the Dialog demo screen).
- The bottom section's actions (Book appointment, WhatsApp us, hotline, email) rely on layer 1 only: once the in-app browser or the external app opens, it covers the screen.
- Layers 2 and 3 provide the guarantees; layer 1 only smooths out jitter.


---

## 9. Localization

- Languages: **English (`en`)** and **Traditional Chinese, Hong Kong (`zh-HK`)** — the PRD's Chinese copy is written Cantonese, so it is `zh-HK`, not generic `zh-Hant`
- Default: device language via `expo-localization`. **Every Chinese locale** (`zh`, `zh-Hant`, `zh-HK`, `zh-TW`, `zh-MO`, and Simplified `zh-Hans`, `zh-CN`, `zh-SG`) → `zh-HK`, because it is the only Chinese the app has and Chinese readers are better served by it than by English. `en-*` → `en`
- **The device language is read leniently.** Its language is the part before the first `-` or `_`, in any letter case, so Android's `zh_TW` and an upper-case `ZH-TW` show Chinese. Anything else shows English, including a value that isn't a language tag (empty, `abc`)
- **Fallback is English** (`fallbackLng: 'en'`): a device language with no matching translation shows English, and a string missing from `zh-HK` shows its English text instead of a blank or a key name
- **The app follows the system language.** There is no in-app language switch. Changing the device language changes the app's language (on iOS the system restarts the app; on Android the app picks up the new locale)
- **Every user-visible string** goes through i18n, including dialog text, error messages, button labels and accessibility labels
- Phone numbers and email are data, not translated
- The contact-info paragraph has a **different sentence structure per language** (EN: multi-line list; ZH: one sentence with the number and email inline). Use `<Trans>` with link components so each language controls its own word order while the hotline and email stay tappable
- Typography per language follows the Figma text styles (read via MCP, §11). Figma defines only one Chinese style (Chinese/Header/Header 2, Noto Sans TC Bold) for the title; Chinese text in the English body styles (Inter, which has no CJK glyphs) uses the system font (PingFang on iOS). Each extra Noto Sans TC weight would add about 7 MB
- **Copy comes from the PRD** (EN + ZH for every section); it is not duplicated here (§11a)
- The error view's copy is defined by this spec, not the PRD (§10)
- Copy not defined by the PRD (Home screen, coming-soon dialog, feature toggles, dialog demo, toast demo) is written by the author in both languages and listed in the PR; the error view and empty state copy is in §10

---

## 10. States

| State | Where | UI |
|---|---|---|
| Loading (first page) | List body | Skeleton cards (same size as SpecialistCard) |
| Error (first page, v1.1.0) | List body | `InlineErrorView` (icon, title, body, Retry as its only action) → refetch; skeleton while it loads again |
| Empty | List body | One line of centred grey text; no icon, no Retry |
| Loading (next page) | List footer | `LoadingSpinner` (iOS's 12-spoke activity indicator, drawn the same on both platforms; React Native's `ActivityIndicator` is Material on Android. Like iOS's, the spokes stay still and only their opacities go round: rotating the view wobbled on Android) between the last card and the contact info, about 24 pt above and below. Its space appears when the page starts loading and stays until the new rows have made the list taller (or 0.5 s passes, or the page failed): the list renders new rows a moment after the page arrives, and removing the space before then would shorten the content and push the scroll position back. Known limitation: any growth of the list counts, so a layout change during that wait, or rows taking over 0.5 s to render on a slow device, could still give the space back early and nudge the scroll position |
| Error (next page, v1.1.0) | List footer | `InlineErrorView`, below the Specialists already shown; Retry → `fetchNextPage`, with the spinner in its place while it loads again |

- **Inline error view (v1.1.0).** The PRD has only a screenshot (with a "Close" button the PRD itself calls incorrect), no Figma frame, no Chinese copy, and text that tells the user to close the app while the only action is Retry. So this spec defines the view, using the PRD screenshot as the layout reference. This deliberately departs from the PRD's wording.

  | | English | Chinese (`zh-HK`) |
  |---|---|---|
  | Title | Oops! | 哎呀！ |
  | Body | Something went wrong. Please try again. | 出咗啲問題，請再試一次。 |
  | Button | Retry | 重試 |

  - One component, `InlineErrorView`, the same for a failed first page (in the list body) and a failed next page (below the Specialists already shown): a dark circled "i" icon, the title, the body and Retry, as in the PRD screenshot. (A compact next-page version, body and Retry only, was tried and dropped by the author.)
  - Retry is a small black button (`PrimaryButton` size `small`: as wide as its label, 40 pt tall, Inter Bold 14), not the full-width primary button, so it doesn't dominate the list.
- **Empty state.** Not defined by the PRD; hardcoded data is never empty, but a CMS with no Specialists configured would be. Copy:

  | | English | Chinese (`zh-HK`) |
  |---|---|---|
  | Body | No Specialists are available right now. | 暫時未有專家提供服務。 |

  No Retry, because reloading an empty list doesn't help; contact info and the bottom section stay available.
- Header, footer content and the bottom section stay visible in every state.
- No pull-to-refresh: neither the PRD nor the brief asks for it, and hardcoded data never changes. Add it with the CMS.
- **Simulated failure (v1.1.0).** When the Feature toggles switch "Simulate loading failure" is on (§4.1):
  - Every request, the first page and Retry included, fails with probability **0.3** (a config value). The author chose this over a rule that the first request after entering the screen always succeeds, so the error view comes up in both places (first and next page) in the demo.
  - A failed first page shows the error view in the list body; a failed next page shows it in the list footer, and Retry loads that page again, appending its Specialists on success.
  - The random source and the switch are injected into the repository (`failureSimulation`): `Math.random` and the feature flag in the app, fixed values in tests.
- **Error handling ships in v1.1.0, not v1.0.0** (ADR-011). v1.0.0 reads hardcoded data that cannot fail, so it has no error state; v1.1.0 adds the inline error view, Retry, and a way to make the hardcoded repository fail for the demo. The README and the v1.0.0 release notes say so, because the brief lists error handling among the general requirements.

---

## 11. Design source (Figma via MCP)

Visual details (colors, typography, spacing, radii, shadows, assets) are **not duplicated in this spec**. They are read from Figma through the Figma MCP server during implementation, so the design file stays the single source of truth.

- File: the author's copy of `Premium-consultation-UI` in their Figma account (edit access is required by the MCP server; the original shared file is view-only)
- Relevant frames: `Premium Consultation/Details` — a full-length frame (all content laid out) and a viewport-height frame (persistent bottom section over scrolling content)

### Procedure

1. Read the design variables (colors, fonts, effects) and generate `src/shared/theme/` from them; use semantic token names, not raw hex values in components
2. Read design context per component (SpecialistCard, bottom section, agreements box, header) and translate to React Native `View` / `Text` / `StyleSheet` — no HTML elements, no Tailwind
3. Export the hero image and icons as assets
4. Ignore leftover layers: hidden layers (tags, timestamps and icons on the cards, an MPF/Manulife card, time slots) and layers outside the frame bounds (e.g. "Insurance material 1")
5. Copy comes from the PRD (§11a), not from Figma text layers; never inline strings
6. Bottom section uses a plain white background regardless of any glass/blur styling in Figma (PRD)
7. **Dark mode:** the app follows the system appearance (`userInterfaceStyle: "automatic"`, with `expo-system-ui` for Android). Figma has only the light design, so `palettes.ts` defines a dark palette with the same semantic names: iOS's dark system colours for the greys, blue and green, darker versions of the yellows, and a lighter `surfaceElevated` for cards and dialogs, since shadows barely show on a dark surface. Colours, gradients and shadows are read only through `useTheme` or `makeStyles`, never module-level constants, so a component re-renders when the user switches; text styles carry no colour and stay constants. The splash screen has a dark background too (`expo-splash-screen` in `app.json`), so a dark-mode launch doesn't flash white

MCP calls are rate-limited on the author's plan: read variables once, then fetch design context only for the components being built.

**Visual checks** use a 390 pt wide device (e.g. the iPhone 17e simulator), the width of the Figma frames. Text columns follow the screen width, so on wider screens lines wrap later than in Figma; that is expected. Sizes are not scaled to the screen: Android dp and iOS pt are the same unit, so text and controls have the same size on both, and a larger screen (e.g. a 411 dp Pixel 8) simply shows them smaller relative to the screen. This keeps the platforms' conventions and the system font-size setting working. To compare Android with Figma, use a device about 390 dp wide (e.g. Pixel 5).

## 11a. PRD source (PDF)

- The PRD is `.private/PRD-PremiumConsultation.pdf`: a single-page image capture of the Confluence page, with no text layer. Unlike Figma, it includes the PRD's UI screenshots.
- **Work from `.private/prd.md`**, a verbatim transcription of the PDF: EN/ZH copy, behaviour notes, and what each screenshot shows. Check the PDF itself only when the transcription is in doubt.
- Two code blocks are cut off in the PDF: the WhatsApp universal link (full URL supplied by the author) and the English pre-filled message (full text visible in the PRD screenshot). The booking URL comes from the PDF's link and was confirmed by the author. All three are recorded in `prd.md`.
- Take from the PRD: section behaviour, EN/ZH copy, booking URL, WhatsApp number and pre-filled messages, hotline, email. The error view's copy comes from this spec instead (§10).
- Copy goes into `locales/en.json` and `locales/zh-HK.json`; URLs and contact values go into the config module.
- The PRD PDF, its transcription and the assignment brief (`.private/GainMiles-WrittenAssignment-PremiumConsultation.pdf`) stay in `.private/` (git-ignored, see §14). Never commit them (company documents); reference the PRD in the PR as "provided separately".

---

## 12. Project structure

```
src/
  app/
    App.tsx                     fonts, splash, the app's services; renders AppProviders + RootNavigator
    navigation.tsx              v1.1.0
    services.ts                 the app's flag service and Specialist repository: one statement each to swap (v1.1.0)
    AppProviders.tsx            every provider, shared by App and the test helper
  features/
    home/
      view/HomeScreen.tsx
      view/FeatureTogglesSheet.tsx         the Feature toggles bottom sheet
      viewmodel/useConsultationEntry.ts    flag on → navigate, off → coming-soon dialog
      viewmodel/useFeatureToggle.ts       one switch of the Feature toggles sheet
    toastDemo/                  v1.1.0
      view/ToastDemoScreen.tsx
      view/ToastMessage.tsx                one toast: fade in, 2 s, fade out
      viewmodel/useToastStack.ts           every press adds a toast
    dialogDemo/                 v1.1.0
      view/DialogDemoScreen.tsx
      viewmodel/useDemoDialogs.ts          the bonus question's three request patterns
    consultation/
      view/ConsultationScreen.tsx          one screen; v1.0.0 plain, v1.1.0 infinite
      view/ConsultationHeader.tsx          title, divider, description
      view/SpecialistCard.tsx
      view/ContactInfo.tsx
      view/AgreementsNotice.tsx
      view/ConsultationBottomSection.tsx
      view/useContentSheetAnimationConfigs.ts  instant until the push transition ends, then the spring
      view/useNextPageSpinner.ts           when the next-page spinner keeps and gives back its space
      view/states/              Skeleton, EmptyState; InlineErrorView (v1.1.0, the same for a failed first and next page)
      viewmodel/useSpecialists.ts          plain (v1.0.0; removed in v1.1.0)
      viewmodel/useInfiniteSpecialistsQuery.ts  infinite (v1.1.0)
      viewmodel/useConsultationActions.ts  booking, WhatsApp, tel, mailto
      viewmodel/useConsultationGate.ts     the route's own flag guard (v1.1.0)
      viewmodel/useComingSoonDialog.ts     the coming-soon dialog (v1.1.0)
  domain/                       core concepts; depends on nothing
    pagination.ts               Page, PageParams (ADR-007)
    specialist/
      Specialist.ts
      SpecialistRepository.ts   the contract the data layer implements
  data/
    specialist/
      HardcodedSpecialistRepository.ts
      CmsSpecialistRepository.ts           stub
      hardcodedSpecialists.ts
      RepositoryProvider.tsx
  shared/
    ui/                         ThrottledPressable, PrimaryButton, ToggleSwitch, LoadingSpinner, HeroBanner, BackNavBar, HeroActionsScreen (Home and demo layout), bottomControlsPadding, useSheetAnimationConfigs (both sheets' spring)
    featureFlags/               FeatureFlagService, LocalFeatureFlagService, FeatureFlagProvider + useFeatureFlag (v1.1.0)
    dialog/                     dialogQueue (the guard and queue), DialogProvider + useDialog, DialogView
    i18n/                       setup + locales/en.json, zh-HK.json
    config/                     contact info, booking URL, flag defaults, press throttle, Specialists' page size, simulated latency and failure rate
    theme/                      palettes.ts (light, dark), theme.ts (useTheme, makeStyles), typography.ts
  test/
    renderApp.tsx               test helper: the app's providers and navigator, a fake repository, a clock past the press throttle
docs/
  adr/
GLOSSARY.md                     repo root, read by the agent skills
```

Layering: **View** (components, no logic) → **ViewModel** (custom hooks) → **Data** (repository implementations), all depending on the **Domain** (the `Specialist` model, the `SpecialistRepository` contract and the pagination types), which depends on nothing. UI and hooks never import a concrete repository. Side-effecting actions (`Linking`, `WebBrowser`) are wrapped in `useConsultationActions` so they can be mocked in tests.

---

## 12a. Naming conventions

Code follows common TypeScript / React Native conventions, and domain names follow `GLOSSARY.md` (e.g. `Specialist`, not `Consultant`). ESLint enforces what it can (`@typescript-eslint/naming-convention`).

| Kind | Convention | Example |
|---|---|---|
| Components, screens, types, interfaces, classes | PascalCase | `SpecialistCard`, `ConsultationScreen`, `SpecialistRepository` |
| Files | Named after their main export, in its case | `SpecialistCard.tsx`, `SpecialistRepository.ts`, `resolveLanguage.ts` |
| Files with several exports and no main one | camelCase, named for their topic | `palettes.ts`, `pagination.ts`, `dialogQueue.ts` |
| Hooks | camelCase with `use` prefix, file named the same | `useInfiniteSpecialistsQuery.ts` |
| TanStack Query hooks | `Query` suffix for queries, `Mutation` suffix for mutations | `useInfiniteSpecialistsQuery`, `useBookConsultationMutation` |
| Functions and variables | camelCase | `openConsultation`, `pageSize` |
| Booleans | `is` / `has` / `should` / `can` prefix | `isEnabled`, `hasNextPage` |
| Event props / handlers | `onX` for props, `handleX` for handlers | `onPress`, `handleRetry` |
| Functions passed to JSX props | Defined outside the JSX (`useCallback`, or at module level when they need nothing from the component) and passed by name; ESLint `react/jsx-no-bind` | `onPress={handleBackPress}`, `keyExtractor={specialistKey}` |
| Module-level constants | SCREAMING_SNAKE_CASE | `BOOKING_URL`, `PAGE_SIZE` |
| React Native style sheets | camelCase `styles`, the React Native idiom (exception to the row above) | `const styles = StyleSheet.create({ … })` |
| Enum-like unions and string literals | camelCase values | `'premiumConsultation'` |
| Folders | camelCase | `featureFlags/`, `specialist/` |
| Tests | `*.test.ts(x)` next to the code under test | `HardcodedSpecialistRepository.test.ts` |
| i18n keys | dot-separated camelCase, grouped by screen | `consultation.bookAppointment` |
| No abbreviations | spell words out, except well-known ones (`id`, `url`) | `specialist`, not `spec` |

---

## 13. Testing strategy (TDD seams)

All behaviour is developed **test-first** with `/tdd` (ADR-010):

- **Red before green.** Write one failing test, then only enough code to make it pass.
- **Vertical slices.** One seam, one test, one minimal implementation per cycle. Never write all tests first and then all code.
- **Public interfaces only.** Tests observe behaviour at the seams below, never internals. Expected values come from the PRD, the spec or a worked example, never recomputed the way the code does.
- **Agreed seams only.** The table below lists the agreed seams. A new seam is confirmed with the author before any test is written for it, then added to this table in the same PR.
- **Bugs start with a failing test** that reproduces them.
- **Refactor at review**, not inside the red → green loop.
- **Commits stay green.** Each commit holds a slice's test and its implementation together, so every commit passes `tsc`, lint and tests.
- **Exceptions:** project scaffolding and config (`T-0003`), and pure styling with no behaviour (checked against Figma instead). The PR states which changes were not test-driven and why.

| Seam | Type | Cases |
|---|---|---|
| `App` smoke test | Component | The app boots with its providers and opens on the Consultation screen (T-0004 to v1.0.0), then on the Home screen (v1.1.0, T-0009; in T-0003 it only proved the test setup worked) |
| `HardcodedSpecialistRepository` | Unit | First page (`offset: 0`), next page by offset, last page (`offset + items.length === total`), offset beyond total returns empty items, order preserved; simulated failure (v1.1.0): with simulation on, a request fails when the injected random value is below 0.3 and succeeds otherwise; with it off, never fails; the extended dataset (v1.1.0): 103 Specialists starting with the base three, specialist-103 on the eleventh page of 10, unique IDs, a two-word name and no photo each |

| `ThrottledPressable` | Component | Two presses within 500 ms → one call; a press after 500 ms → a second call; the first press fires immediately; with the press throttle switched off (`pressThrottle`), a second press within 500 ms fires too |
| `DialogManager` | Unit | `show` twice with the same ID (called directly, not through a button) → one dialog; same ID while queued → ignored; different IDs → queued; close → next shown; the same ID requested after it closed → shown again; closing an already closed dialog leaves the next one showing; with de-duplication off, the same ID twice → shown twice in turn; with the queue off, different IDs → stacked at once, closing the top one leaves the others; with both off, the same ID twice → stacked twice; a stacked dialog closed twice → the one below with the same ID stays; the queue switched while dialogs wait → they still close |
| Dialog demo screen | Component | One dialog pressed twice quickly → A once; Press two buttons, same dialog → A once; Three dialogs at once → A, then B, then C as each closes; with de-duplication and the queue switched off, Press two buttons, same dialog → two A stacked |
| Toast demo screen | Component | Two quick presses on Toast A → one toast with the press throttle on, two with it off; each toast fades out on its own schedule while new ones arrive |
| `useConsultationEntry` | Hook (through the Home screen, its only caller) | Flag on → the Consultation screen opens; flag off → the coming-soon dialog shows |
| Home screen | Component | Double press with flag off (past the press throttle) → exactly one dialog, and none after it closes; switching Premium consultation off in the Feature toggles sheet → the entry button shows the coming-soon dialog; the press throttle switched off there; dialog de-duplication and the dialog queue switched off there; with the press throttle off, a double press still opens the Consultation screen once; simulated loading failure switched on there |
| `useInfiniteSpecialistsQuery` | Hook | Loads first page; `fetchNextPage` appends; no fetch when `!hasNextPage` or already fetching; duplicate IDs across pages are removed; no fetch after the next page failed (only Retry loads it again) |
| `useNextPageSpinner` | Hook | Shows while the next page loads; after it arrives, stays until the list gets taller; goes 0.5 s after it arrives if the list never does; goes at once when the next page fails |

| `useConsultationActions` | Hook | Book → `openBrowserAsync` with booking URL; WhatsApp → `wa.me` URL with encoded message in the current language; hotline → `tel:`; email → `mailto:`; an action whose link the device cannot open does not throw |
| `ConsultationScreen` (v1.0.0, plain) | Component | Loading skeleton; empty; a failed load does not show the empty state; list renders the 3 base names in order; contact info and agreements present; back button has no effect |
| `ConsultationScreen` (v1.1.0, infinite) | Component | Loading skeleton; first page renders; reaching the end loads the next page with a footer spinner; back button returns to Home; a double press on it (press throttle off) goes back once; opened while the flag is off (a deep link) → coming-soon dialog and reset to Home; the flag turned off while it is open → coming-soon dialog and back to Home; a failed first page shows the error view and Retry loads it; a failed next page shows the error view below the loaded Specialists, the spinner replaces it while Retry loads, and the page is appended; entering the screen again starts from the first page |
| i18n | Component | Key strings render in both languages; a string missing from `zh-HK` shows its English text; contact links remain tappable in both languages |
| Locale resolution (T-0004) | Unit | Language `zh` with any script or region (`zh-Hant-HK`, `zh-Hant-TW`, `zh-Hant-MO`, `zh-Hans-CN`, `zh-Hans-SG`, `zh`) → `zh-HK`; `en-US`, `en-GB` → `en`; any other language (`ja-JP`, `fr-FR`, and `zha-CN`, Zhuang, whose code only starts with "zh") → `en` |

Tests inject a fake `SpecialistRepository` and a fresh `QueryClient` per test (retries disabled). `Linking` and `expo-web-browser` are mocked.

---

## 14. Delivery

### Repository and PR

> **Branching:** `main` ← `dev` ← `feats/vX.Y.Z`
> - `main`: initial commit with `README.md` only (no code). `.gitignore`, `CLAUDE.md` and this spec land through ticket `T-0001` (ADR-008)
> - `dev`: branched from `main`; integration branch
> - `feats/vX.Y.Z`: **one branch per release** (`feats/v1.0.0`, then `feats/v1.1.0`), cut from an up-to-date `dev`. Every ticket of that release is built on it as a group of commits; tickets do not get their own branches. (`T-0001` and `T-0002`, done before this rule, kept their own `feats/T-XXXX-[TicketName]` branches.)
> - Tickets: `T-XXXX`, an auto-incrementing, zero-padded 4-digit number (`T-0001`, `T-0002`, …), assigned in ticket order and never reused. Each ticket is a GitHub issue in the Milestone named after its release (`v1.0.0` or `v1.1.0`)
> - Releases (ADR-011): when every ticket of a release is done and reviewed on its branch:
>   1. PR `feats/vX.Y.Z` → `dev`, merged with GitHub's **default merge commit message**
>   2. PR `dev` → `main`, merged with the merge commit message **"Release vX.Y.Z"**
>   3. Annotated tag `vX.Y.Z` on that merge commit, and a GitHub Release with release notes and demo videos
>      - `v1.0.0` is released without videos. The author records the videos and screenshots of both releases once `v1.1.0` is done, puts them in the final README, and the `v1.0.0` Release is then edited to attach its videos (the tag does not move)
>      - In the end both videos were recorded after the `v1.1.0` tag. Tags never move, so the README demo ships as `v1.1.1`, a docs-only patch release through the same flow (`feats/v1.1.1` → `dev` → `main`, tag, Release with the video and screenshots attached)
>   4. The next release branch is cut from `dev`
> - Submission: the `v1.1.0` PR `dev` → `main` is the one handed to the interviewer. `v1.0.0` is merged and released by the author beforehand; the README explains both releases so the interviewer can check out either tag
> - Small Conventional Commits while a ticket is in progress. Before a release branch is first pushed, each ticket's commits are squashed into one commit per ticket, so the release PR reads ticket by ticket. After that, respond to review with new commits (no force-push during review)
> - PRs merge with a merge commit (`--no-ff`); squash and rebase merges are disabled on GitHub. Release branches (and the earlier ticket branches) are kept after merge, locally and on `origin`, so reviewers can clone and inspect each PR's branch (ADR-009)
> - Code owner: `.github/CODEOWNERS` assigns every path to `@LoS-Light`, so PRs mark owned files and request the owner's review. Not enforced as a required review: the repo is private on a free plan, so branch protection is unavailable

### .gitignore

> Created in `T-0001` (before scaffolding, ADR-008); merge the Expo template's entries when scaffolding in `T-0003`. It must exclude `.private/` (PRD PDF and its transcription, assignment brief PDF), `__MACOSX/`, secrets and generated native folders, and must **not** exclude `package-lock.json`.

### CI (GitHub Actions on pull_request)

`npm ci` → `tsc --noEmit` → `npm run lint` → `npm test`, Node version from `.nvmrc`.

### README

Releases (what `v1.0.0` and `v1.1.0` each cover, and how to check out either tag), setup (Node version, `npm ci`, `npx expo start`), architecture overview, how to swap to CMS, the feature toggles sheet (feature flag and simulated failure) and why the in-app flag switch is a demo shortcut rather than the production approach (Firebase Remote Config or the CMS, §7), how to run tests. Demo screenshots and the demo video live in `demo/` and are shown at the top of the README, with a quick start for the reviewer; the video is compressed to H.264 so it stays small enough for git.

### PR description (release PRs `dev` → `main`)

Senior items (feature flag, double-press, infinite scroll, §6.3, §7, §8) apply to the `v1.1.0` PR only.

Summary · Demo (screenshots + videos: feature flag on/off, double-press, infinite scroll, both languages (via the device language setting), error + retry, booking and WhatsApp redirects) · How to run · Architecture · Requirements checklist (brief + PRD) · Senior answers (§6.3, §7, §8) · Trade-offs and assumptions · Future work (CMS, remote flags, restoring automatic query retries)

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
- Ticket name: short PascalCase, used in the issue title `T-XXXX: [TicketName]` (e.g. `T-0003: ProjectScaffolding`).
- Each ticket lists: the spec sections it covers, its acceptance criteria (from §15), its TDD seams (from §13), and the tickets it is blocked by.
- Tickets are built in order on their release branch (`feats/vX.Y.Z`); one ticket is a group of commits, not a branch or a PR. Keep tickets small enough to review in one sitting.
- Fixed opening tickets (ADR-008):
  - `T-0001 RepoSetup`: `.gitignore`, `CLAUDE.md`, agent skills config, PR template and this spec. No app code.
  - `T-0002 SpecRefinement`: refine this spec with `/grill-with-docs` against the PRD, assignment brief and Figma. No app code.
  - `T-0003 ProjectScaffolding`: project scaffolding (Expo, TypeScript, lint, test, CI, `.nvmrc`, merging the `.gitignore`).
- The last ticket of each release covers the README, final docs and that release's PR descriptions (`T-0008 ReadmeAndDemo`, `T-0014 SeniorDocsAndDemo`).

### `/implement` — per ticket

1. Work on the release branch. The first ticket of a release creates it from an up-to-date `dev`:
   `git checkout dev && git pull && git checkout -b feats/vX.Y.Z`
2. Do not start a ticket until every ticket it is blocked by is done and reviewed.
3. Implement only this ticket's scope, **test-first with `/tdd`** at the seams listed in the ticket, following the rules in §13 (ADR-010).
4. Before each commit: `npx tsc --noEmit`, lint, and the relevant test files. Before opening the PR: the full test suite.
5. Commit with Conventional Commits, referencing the ticket (e.g. `chore(T-0003): add Jest and React Native Testing Library`).
6. **Stop after each ticket.** Commit locally and report to the author; do not push. Start the next ticket only after the author has reviewed this one.
7. Push and open PRs only when the author asks. The release PR `feats/vX.Y.Z` → `dev` lists every ticket it closes; its body follows the PR template: summary, spec sections covered, acceptance criteria per ticket, tests added, screenshots/video for UI changes, decisions (link ADRs).
8. **Do not merge PRs yourself.** The author merges with a merge commit (`--no-ff`); branches are kept after merge (ADR-009).

### Always

- Never commit directly to `main` or `dev`; never force-push a branch that has an open PR.
- Never delete a release branch (or an earlier ticket branch), locally or on `origin`, unless the author asks.
- Never commit anything from `.private/` or secrets.
- Record every new or changed decision in this spec, in the same PR, and list it in the PR's Decisions section.
- Also write an ADR in `docs/adr/` only when all three hold: hard to reverse, surprising without context, and the result of a real trade-off. Otherwise the spec is enough.
- ADR numbering: ADR-002, ADR-005 and ADR-007 were written for decisions the original draft already named; ADR-001, 003, 004 and 006 stay unused. Every new ADR takes the highest existing number + 1 (from 012). Files are named `NNNN-slug.md`; titles and references use three digits (`ADR-012`).
- ADR format: a title and one to three sentences (context, decision, why). Add Status, Considered Options or Consequences only when they add value. ADR-008 to ADR-010 keep their longer format.
- Every pressable uses `ThrottledPressable` (§8a); never use `Pressable` or `TouchableOpacity` directly. Open screens with `navigation.navigate` (never `push`), so a double press can't stack a screen (§8a, v1.1.0).
- Follow the naming conventions in §12a.
- If the spec is ambiguous, stop and ask the author instead of guessing; record the answer in this spec, and as an ADR only if it passes the three-part test below.
- Remind the author to export the conversation (`/export`) at the end of each session.

### Final submission

For each release (ADR-011), when all of its tickets are done and reviewed on `feats/vX.Y.Z`:

1. Complete the pre-submit checklist (§14).
2. When the author asks: open the PR `feats/vX.Y.Z` → `dev`. The author merges it with GitHub's default merge message.
3. Open the PR `dev` → `main` titled `Release vX.Y.Z`, using the PR description outline in §14. The author merges it with the merge commit message "Release vX.Y.Z".
4. Tag that merge commit (`git tag -a vX.Y.Z`), push the tag, and publish the GitHub Release.

`v1.0.0` covers the general requirements; `v1.1.0` covers the senior requirements and is the PR handed to the interviewer.

---

## 15. Acceptance criteria

### v1.0.0 — general requirements

- [ ] The app opens on the Consultation screen
- [ ] Consultation screen matches Figma visuals and PRD behaviour
- [ ] Persistent white bottom section with service hours and two black buttons, built with `@gorhom/bottom-sheet`
- [ ] Book appointment opens the booking site in an in-app browser with an option to open externally
- [ ] WhatsApp us opens a chat with the PRD's ES number and a localized pre-filled message
- [ ] Hotline opens the dialer pre-filled; email opens the mail app with the recipient pre-filled
- [ ] Back button is rendered and does nothing
- [ ] Specialist list is static (no interaction) and rendered in data-source order
- [ ] Specialist data loaded through TanStack Query via `SpecialistRepository`
- [ ] Loading and empty states
- [ ] All visible text localized in English and Chinese (Hong Kong) using PRD copy, following the device language
- [ ] Swapping hardcoded data for CMS requires changing only the provider setup
- [ ] Reproducible build, CI green, README explains both releases and that error handling ships in v1.1.0
- [ ] Release PR merged into `main`, tagged `v1.0.0`, GitHub Release published (demo videos attached after `v1.1.0`, §14)

### v1.1.0 — senior requirements

- [ ] Home screen with an entry button is the app's entry point
- [ ] Back button on the Consultation screen returns to Home
- [ ] Feature flag gates entry from Home and the route itself; coming-soon dialog when disabled
- [ ] Rapid double press opens the dialog once, covered by a test
- [ ] Infinite scroll over 103 Specialists (3 base + 100 generated) without duplicate page fetches
- [ ] Inline error view, with Retry as its only action, when the first page fails; Retry reloads
- [ ] Next-page loading indicator, and next-page inline error with Retry
- [ ] Hardcoded repository can be made to fail for the demo
- [ ] Plain vs infinite comparison documented
- [ ] Release PR `dev` → `main` submitted to the interviewer with demo videos; tagged `v1.1.0` after merge
