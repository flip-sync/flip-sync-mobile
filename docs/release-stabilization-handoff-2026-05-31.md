# FlipSync Release Stabilization Handoff

Date: 2026-05-31

This handoff summarizes the current release-stabilization direction across `flip-sync-mobile` and `flip-sync-be`.

## Direction

The current priority is not broad feature expansion. The priority is to stabilize the internal-test release candidate:

- Lock down the current mobile and backend change scope.
- Verify the core P0 flows on a real installed app.
- Keep backend deployment, EAS Update, AAB build, and Google Play upload behind explicit user approval.
- Improve traceability for server errors, upload failures, and realtime state issues.

## Mobile State

- Repository: `flip-sync-mobile`
- Branch: `develop`
- Last known commit before this handoff: `237eebb feat: 1차 수정본 완료`
- Next orchestrator task: `RSA-A-002`, run `npx tsc --noEmit`

Main release-candidate areas:

- Auth/session refresh flow in `common/api/client.ts`, `common/api/session.ts`, and `api/interceptors.ts`.
- Keyboard/SafeArea/input fixes across auth, room, profile, account, and score screens.
- Room creation UX with 4-digit password policy and recent room settings.
- Score upload progress, duplicate-submit guard, score library filters, favorites, and recent scores.
- WebSocket token refresh before connect and shared-view close handling.
- Invite, app-info, legal, and account-deletion screens.

Mobile checks before release:

```powershell
cd D:\codex\flip-sync\flip-sync-mobile
npx tsc --noEmit
git diff --check
```

Mobile QA focus:

- Signup, email verification, login persistence, refresh-token renewal.
- Room create/join/leave, owner transfer, delete, kick.
- Score upload, score send modal, score library search/sort/favorite/recent.
- Shared view start, page change, fullscreen, owner close sync.
- Invite deep link and app-info/legal/support screens.

## Backend State

- Repository: `flip-sync-be`
- Branch: `main`
- Last known commit before this handoff: `e25cfa3 Force H2 for integration tests`

Backend release-candidate areas:

- Optional Redis realtime gateway with default `in-memory` mode.
- In-memory WebSocket stale-session cleanup and presence rebroadcast.
- `X-Request-Id` filter and log tracing.
- `/mob/invite/:id` preview/fallback improvements.
- GitHub Actions uptime workflow for `/mob/ready` and `/mob/health`.

Backend checks before release:

```powershell
cd D:\codex\flip-sync\flip-sync-be
git diff --check
.\gradlew.bat :flip-sync-server:test
.\gradlew.bat :flip-sync-server:build --no-daemon
```

Backend smoke after deploy:

```powershell
curl.exe -i https://fliplyze.com/mob/ready
curl.exe -i https://fliplyze.com/mob/health
curl.exe -I https://fliplyze.com/mob/invite/1
```

## Do Not Proceed Without User Approval

- Backend production deployment.
- EAS Update.
- Android AAB build.
- Google Play internal-test upload.
- Enabling Redis realtime mode in production.
- Secret rotation or resource-yml repository changes.
- Reverting large dirty changes.

## Sensitive Files

- Do not commit `credentials/*.json`.
- Do not print backend yml secrets in logs or docs.
- Mobile `.env` is tracked and should remain public-value only.
