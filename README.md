# Premium Consultation

The Premium Consultation screen of the GUM app, built with React Native (Expo SDK 58, TypeScript). It introduces the ES team's Specialists and lets the user book an appointment, chat on WhatsApp, call the hotline or send an email. Copy is in English and Traditional Chinese (Hong Kong), following the device language.

The full specification is [`docs/SPEC.md`](docs/SPEC.md); decisions are recorded as ADRs in [`docs/adr/`](docs/adr/), and domain terms in [`GLOSSARY.md`](GLOSSARY.md).

## Releases

The assignment's general and senior requirements disagree on the entry point (the Figma screen versus a flag-gated Home button), so the work ships in two releases ([ADR-011](docs/adr/0011-two-releases.md)).

| Release | Entry point | Contents |
|---|---|---|
| `v1.0.0` (general requirements) | The Consultation screen | Hero and content bottom sheet matching Figma; the three base Specialists loaded through TanStack Query from a swappable repository; loading skeleton and empty state; Book appointment (in-app browser), WhatsApp us (pre-filled message per language), tappable hotline and email; English and Chinese (Hong Kong) copy from the PRD; a back button that is shown but does nothing |
| `v1.1.0` (senior requirements) | A Home screen with the entry button | A feature flag that gates the entry, a de-duplicated "coming soon" dialog and a dialog demo screen for the bonus question, infinite scroll over 103 Specialists, a working back button, a demo settings menu, and **error handling** |

**Error handling ships in `v1.1.0`.** `v1.0.0` reads hardcoded data that cannot fail, so the error view, Retry and the switch that simulates failures arrive together in `v1.1.0` ([ADR-011](docs/adr/0011-two-releases.md)). In `v1.0.0`, a failed load still shows the header, contact info and bottom section, with no list and no message.

To run a release, check out its tag:

```sh
git checkout v1.0.0   # or v1.1.0
```

## Setup

Requirements: Node 24 (the exact version is in [`.nvmrc`](.nvmrc)), and Xcode for the iOS simulator or Android Studio for an Android emulator.

```sh
nvm use        # Node 24.22.1 from .nvmrc
npm ci
npx expo start
```

Then choose where to run it. The project uses Expo SDK 58, and each Expo Go release supports one SDK only.

| Target | How |
|---|---|
| iOS simulator | Press `i`. Expo CLI installs the matching Expo Go in the simulator. |
| Android emulator or device | Press `a`, or scan the QR code with Expo Go. Expo CLI installs the matching Expo Go on emulators and connected devices. |
| iPhone | When writing this, the App Store's Expo Go only supports SDK 57, so it reports "Project is incompatible with this version of Expo Go". Either wait until Expo Go for SDK 58 reaches the App Store and scan the QR code, or build the app onto the phone with Xcode: turn on Developer Mode on the iPhone, connect it, and run `npx expo run:ios --device` (needs an Apple ID signed in to Xcode). |

To see the Chinese copy, set the device language to Chinese (any `zh` locale shows Traditional Chinese, Hong Kong); every other language shows English.

## Checks

```sh
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint and Prettier
npm test            # Jest and React Native Testing Library
npx expo-doctor
```

CI runs `npm ci`, the type check, lint and tests on every pull request ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

Behaviour is developed test-first at agreed seams ([ADR-010](docs/adr/0010-test-driven-development.md), SPEC §13): the repository, the press throttle, locale resolution and i18n fallback, the action hook, the app smoke test and the Consultation screen's states. Pure styling is checked against Figma instead.

## Architecture

Three layers: **View** (components, no logic) → **ViewModel** (hooks) → **Data** (a repository interface). Views and hooks never import a concrete repository.

```
src/
├── app/                     App (fonts, providers) and the one place that picks the data source
├── data/specialist/         Specialist model, SpecialistRepository interface,
│                            HardcodedSpecialistRepository, CmsSpecialistRepository (stub)
├── features/consultation/
│   ├── view/                ConsultationScreen and its parts (hero, header, cards,
│   │                        contact info, agreements notice, bottom section, states)
│   └── viewmodel/           useSpecialists (TanStack Query), useConsultationActions
│                            (in-app browser, WhatsApp, tel:, mailto:)
└── shared/                  theme, config (contact values, URLs), i18n, ThrottledPressable
```

- **Data** ([ADR-002](docs/adr/0002-specialist-repository.md)): screens read Specialists only through `SpecialistRepository`, provided by `RepositoryProvider`. The interface is paginated by offset ([ADR-007](docs/adr/0007-offset-pagination.md)) so `v1.1.0` can add infinite scroll without changing it. The hardcoded repository adds a short simulated delay so the loading state is visible.
- **Layout** ([ADR-012](docs/adr/0012-content-bottom-sheet.md)): the hero image stays fixed and the content is a `@gorhom/bottom-sheet` over it. The sheet opens at Figma's card position, can grow up to the nav bar and never closes. Its list holds the header, Specialists, contact info and agreements notice; its footer is the persistent bottom section with the service hours and the two buttons.
- **Actions**: every side effect (`expo-web-browser`, `Linking`) goes through `useConsultationActions`, so tests can mock it. Every pressable, including the inline hotline and email links, goes through a 300 ms leading-edge throttle (`ThrottledPressable` / `useThrottledPress`), so a double tap opens one browser or dialer.
- **Localization**: `i18next` with `expo-localization`. Copy comes from the PRD; the contact sentence uses `<Trans>` so each language keeps its own sentence structure with tappable links.

### Swapping to the CMS

The data source is chosen in one statement in [`src/app/specialistRepository.ts`](src/app/specialistRepository.ts). When the Q2 CMS exists, implement `CmsSpecialistRepository.getSpecialists` and replace that statement:

```ts
export const specialistRepository: SpecialistRepository = new CmsSpecialistRepository();
```

No screen, hook or test changes.

## Known limitations (`v1.0.0`)

- No error view or Retry; they ship in `v1.1.0` (see above).
- Once the list inside the expanded sheet has been scrolled, collapsing the sheet needs a new drag that starts at the top of the list. This is how `@gorhom/bottom-sheet` hands gestures between the sheet and its list.
- The hotline is shown as "+852 2893 4402" in both languages, from one config value; the PRD's Chinese copy writes it as "28934402".
- If the system cannot open a link (for example, no mail app is set up), nothing is shown to the user.
