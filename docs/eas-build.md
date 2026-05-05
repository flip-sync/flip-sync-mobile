# EAS Build

This project is ready to build with EAS as an Expo managed app.

## Prerequisites

- Log in to Expo:
  - `npx eas-cli login`
- Link or create the Expo project once:
  - `npx eas-cli init`

## Project linking

This project now supports Expo project linking through environment values used by
[`app.config.ts`](D:/codex/flip-sync/flip-sync-mobile/app.config.ts).

Current linked Expo project:

- `@jangkt/flipsync`
- `ee0a9280-f5d5-45dc-b5b9-9c30d4ed1f2f`

- Expo account owner:
  - `EXPO_OWNER`
- EAS project id:
  - `EXPO_PROJECT_ID`

You can start from:

- [`.env.eas.example`](D:/codex/flip-sync/flip-sync-mobile/.env.eas.example)

Typical flow:

1. Run `npx eas-cli login`
2. Run `npx eas-cli init`
3. Copy the generated account owner and project id
4. Set `EXPO_OWNER` and `EXPO_PROJECT_ID`
5. Run `npx expo config --json` and verify `owner` and `extra.eas.projectId`

## Build profiles

- `development`
  - development client build
- `preview`
  - internal distribution build
- `production`
  - store-ready build with automatic remote version increment

All profiles currently target:

- `EXPO_PUBLIC_API_URL=https://fliplyze.com/mob`

Each build profile is also pinned to the matching EAS environment:

- `development` -> `development`
- `preview` -> `preview`
- `production` -> `production`

## Commands

- Expo project init:
  - `npm run eas:init`
- Android production:
  - `npm run eas:build:android`
- iOS production:
  - `npm run eas:build:ios`
- Android + iOS production:
  - `npm run eas:build:all`
- Android preview:
  - `npm run eas:build:preview:android`
- Android development client:
  - `npm run eas:build:dev:android`
- Android credentials setup:
  - `npm run eas:credentials:android`
- iOS credentials setup:
  - `npm run eas:credentials:ios`
- Pull Apple metadata from App Store Connect:
  - `npm run eas:metadata:pull`
- Push Apple metadata to App Store Connect:
  - `npm run eas:metadata:push`
- Android internal submit:
  - `npm run eas:submit:android:internal`
- Android production submit:
  - `npm run eas:submit:android:production`
- iOS production submit:
  - `npm run eas:submit:ios:production`
- Android + iOS production submit:
  - `npm run eas:submit:all:production`

## Submit profiles

[`eas.json`](D:/codex/flip-sync/flip-sync-mobile/eas.json) currently includes:

- `internal`
  - Android application id: `com.fliplyze.flipsync`
  - Android track: `internal`
  - Good for Play internal testing uploads
- `production`
  - Android application id: `com.fliplyze.flipsync`
  - Android track: `production`
  - Release status: `draft`
  - `changesNotSentForReview: true`
  - iOS app name: `FlipSync`
  - iOS primary language: `ko`
  - Apple metadata source: [`store.config.json`](D:/codex/flip-sync/flip-sync-mobile/store.config.json)

For iOS, the profile is now ready for metadata sync, but store identifiers and
credentials still need real values from App Store Connect before fully
non-interactive CI submission.

Needed iOS values:

- `ascAppId`
  - App Store Connect app id
- optionally `appleTeamId`
  - if your Apple account uses multiple teams
- optionally `appleId`
  - only if you authenticate with Apple ID plus app-specific password
- recommended App Store Connect API key fields
  - `ascApiKeyPath`
  - `ascApiKeyIssuerId`
  - `ascApiKeyId`

Needed Android values for fully automated submit:

- Google Play Console app must exist already
- First upload must be done manually once
- Service account key must be uploaded to Expo credentials or provided locally
  - Expo docs say API-based Android submit only works after one manual upload
  - If you keep the key in Expo credentials, `track` in `eas.json` is usually enough
  - If you want local-file based submit, store the JSON key in `.secrets/`
    and add `serviceAccountKeyPath` later

Related files:

- [`eas.json`](D:/codex/flip-sync/flip-sync-mobile/eas.json)
- [`store.config.json`](D:/codex/flip-sync/flip-sync-mobile/store.config.json)
- [`.env.eas.example`](D:/codex/flip-sync/flip-sync-mobile/.env.eas.example)
- [`eas-submit-setup.md`](D:/codex/flip-sync/flip-sync-mobile/docs/eas-submit-setup.md)

## Notes

- The app uses `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_API_BASE_URL`, so EAS env values are enough for API targeting.
- `react-native-config` was removed because the current app does not use it and it can complicate Expo managed EAS builds.
- Before submitting to stores, verify the final app icons, permissions text, and store credentials in the Expo dashboard.
