# FlipSync EAS Submit Setup

이 문서는 `FlipSync`를 Google Play와 Apple App Store에 올리기 전에,
실제 `EAS Submit` 값과 자격증명을 어떤 순서로 채워야 하는지 정리한 문서입니다.

## 1. 현재 이미 반영된 설정

- [`eas.json`](D:/codex/flip-sync/flip-sync-mobile/eas.json)에 build 환경 매핑이 들어가 있습니다.
  - `development -> development`
  - `preview -> preview`
  - `production -> production`
- Android submit profile에는 `applicationId: com.fliplyze.flipsync`가 들어가 있습니다.
- iOS production submit profile에는 아래 기본값이 들어가 있습니다.
  - `appName: FlipSync`
  - `language: ko`
  - `metadataPath: ./store.config.json`
- Apple 스토어 메타데이터 초안은 [`store.config.json`](D:/codex/flip-sync/flip-sync-mobile/store.config.json)에 정리되어 있습니다.

## 2. 아직 직접 채워야 하는 값

### Android

- Google Play Console에 앱 생성
- 첫 Android 업로드 1회 수동 처리
  - Expo 공식 문서 기준으로 API 기반 Android submit은 첫 수동 업로드 후에 안정적으로 사용할 수 있습니다.
- Google Service Account JSON 키 준비
  - 권장 로컬 경로: `.secrets/google-play-service-account.json`
- 필요 시 `eas.json`의 `submit.production.android.serviceAccountKeyPath` 추가

### iOS

- App Store Connect에서 `ascAppId` 확인
- 필요 시 `appleTeamId` 확인
- App Store Connect API Key 생성
  - 권장 로컬 경로: `.secrets/AuthKey_<KEY_ID>.p8`
- `ascApiKeyId`
- `ascApiKeyIssuerId`
- 리뷰 연락처 정보
- 리뷰어 테스트 계정

## 3. 권장 인증 방식

### Android

- 가장 단순한 방식
  - `npm run eas:credentials:android` 실행
  - Expo 쪽에 Google Play 자격증명을 연결

### iOS

- 권장 방식
  - App Store Connect API Key 사용
- 대안 방식
  - `EXPO_APPLE_ID` + `EXPO_APPLE_APP_SPECIFIC_PASSWORD`

Apple ID 기반 방식은 동작은 가능하지만, 장기적으로는 API Key 방식이 더 안정적입니다.

## 4. 실제 반영 순서

1. `.secrets/` 아래에 비밀 파일을 둡니다.
2. Android는 Google Play Console 앱 생성과 첫 수동 업로드를 끝냅니다.
3. iOS는 App Store Connect에서 앱 생성 후 `ascAppId`를 확인합니다.
4. `npm run eas:credentials:android` 실행
5. `npm run eas:credentials:ios` 실행
6. 필요 시 [`eas.json`](D:/codex/flip-sync/flip-sync-mobile/eas.json)에 아래 값을 추가합니다.
   - `submit.production.android.serviceAccountKeyPath`
   - `submit.production.ios.ascAppId`
   - `submit.production.ios.appleTeamId`
   - `submit.production.ios.ascApiKeyPath`
   - `submit.production.ios.ascApiKeyId`
   - `submit.production.ios.ascApiKeyIssuerId`
7. Apple 메타데이터를 점검합니다.
   - `npm run eas:metadata:push`
8. Android internal / iOS production 빌드 후 제출합니다.

## 5. 추천 명령어 순서

### Android 내부 테스트

```bash
npm run eas:build:preview:android
npm run eas:submit:android:internal
```

### Android 프로덕션 제출

```bash
npm run eas:build:android
npm run eas:submit:android:production
```

### iOS 프로덕션 제출

```bash
npm run eas:build:ios
npm run eas:metadata:push
npm run eas:submit:ios:production
```

## 6. 실무 메모

- `store.config.json`은 현재 Apple App Store용 메타데이터 초안입니다.
- 리뷰어 계정과 연락처 정보는 아직 코드에 넣지 않았습니다.
- `ascAppId`, `appleTeamId`, API key 정보는 실제 콘솔 값이 확인된 뒤 반영하는 것이 안전합니다.
- 민감 파일은 `.secrets/` 아래에 두면 현재 `.gitignore`에 의해 커밋되지 않습니다.
