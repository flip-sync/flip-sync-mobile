# Phase 2 API Client Inventory

## Base URL

- Default API base URL: `https://fliplyze.com/mob`
- Runtime override order:
  - `EXPO_PUBLIC_API_BASE_URL`
  - `EXPO_PUBLIC_API_URL`
  - `Constants.expoConfig.extra.apiUrl`
  - default URL

Source:

- `common/api/client.ts`
- `api/index.ts`

## Client Families

### Axios Client

Files:

- `api/index.ts`
- `api/interceptors.ts`

Behavior:

- Adds `Authorization: Bearer <accessToken>` from `AsyncStorage("token")`.
- Adds `X-Organization-Id` from `AsyncStorage("activeOrganization")`.
- Refreshes access token on `401_*` except `/user/login/refresh`.
- Persists refreshed token back to AsyncStorage and in-memory auth session.
- Clears session and reloads app when refresh fails.

Current consumers:

- `hooks/auth/index.ts`
- `hooks/organization/index.ts`
- `hooks/room/index.ts`
- `hooks/score/index.ts`
- `hooks/user/index.ts`
- `app/invite/[groupId].tsx`
- `app/legal/account-deletion.tsx`

### Fetch Client

Files:

- `common/api/client.ts`
- `common/api/auth.ts`
- `common/api/app-version.ts`

Behavior:

- Adds in-memory auth and active organization headers when present.
- Does not read AsyncStorage directly.
- Does not refresh access tokens on 401.
- Throws a plain `Error` using the server response message.

Current consumers:

- Login/signup/reset-password/email verification screens through `@/common`.
- App version policy checks in `components/AppUpdateGate.tsx`.
- App version policy checks in `app/(score)/app-info.tsx`.

## REST Endpoints

### Auth

- `GET /user/verify-email`
- `POST /user/verify-email/check`
- `POST /user/signup`
- `POST /user/login`
- `POST /user/login/refresh`
- `POST /user/reset-password`

### User

- `GET /user/me`
- `PUT /user/me`
- `PUT /user/me/profile-image`
- `PUT /user/me/email`
- `DELETE /user/me`

### Organization

- `GET /organization/my`
- `GET /organization/{organizationId}`
- `POST /organization`
- `POST /organization/join`
- `DELETE /organization/{organizationId}`

### Room

- `GET /group`
- `GET /group/my`
- `GET /group/users`
- `GET /group/{groupId}`
- `GET /group/invite/{groupId}`
- `POST /group`
- `POST /group/join`
- `DELETE /group/leave`
- `PATCH /group/{groupId}/owner`
- `DELETE /group/{groupId}`
- `DELETE /group/{groupId}/users/{targetUserId}`

### Score

- `GET /group/{groupId}/score`
- `GET /group/{groupId}/score/{scoreId}`
- `POST /group/{groupId}/score`
- `GET /organization/score`
- `GET /organization/score/{scoreId}`
- `POST /organization/score`
- `DELETE /organization/score/{scoreId}`
- `POST /organization/score/{scoreId}/send/group/{groupId}`

### App Metadata

- `GET /app/version-policy?platform={android|ios}`

## WebSocket

File:

- `hooks/score/useSharedScoreSync.ts`

Endpoint:

- `wss://fliplyze.com/mob/webchatws/group/{groupId}?token={accessToken}`

Behavior:

- Reads access token from in-memory session first, then AsyncStorage.
- Maintains heartbeat and reconnect with exponential backoff.
- Cleans up socket on hook unmount.
- Does not refresh token before reconnect when the access token is expired.

## Risks For Next Steps

- Fetch client and Axios client duplicate auth behavior.
- Fetch client has no refresh-token retry path.
- WebSocket reconnect can reuse an expired access token.
- Axios refresh clears the whole app with `reloadAppAsync`, which is heavy-handed for recoverable auth failures.
- Protected API usage should stay on Axios until the fetch client gains refresh/retry.

