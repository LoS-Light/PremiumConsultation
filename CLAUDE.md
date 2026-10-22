# PremiumConsultation

Follow the workflow in docs/SPEC.md §14a for every ticket, branch, commit and PR.

## Expo

- Expo SDK 58 (managed workflow). Expo changes APIs every SDK release, so check the versioned docs (https://docs.expo.dev/versions/v58.0.0/) before using an Expo or React Native API, rather than relying on memory.
- Add packages with `npx expo install <package>` so versions match the SDK. Dev tools go in `devDependencies` (`expo install` may put them in `dependencies`; move them).
- Navigation (SPEC §3): v1.0.0 has a single screen and no navigation library; v1.1.0 adds React Navigation (JS stack with iOS transitions, ADR-013). Do not use Expo Router.
- Checks: `npm run typecheck`, `npm run lint`, `npm test`, `npx expo-doctor`.

## Agent skills

### Issue tracker

Issues live in GitHub Issues on LoS-Light/PremiumConsultation (via `gh`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
