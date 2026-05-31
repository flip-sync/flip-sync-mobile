# Phase 2 Update Policy UX

작성일: 2026-05-28

## 목표

EAS Update와 스토어 빌드 업데이트가 사용자에게 섞여 보이지 않도록 정책을 분리한다.

## 현재 정책

| 업데이트 종류 | 판정 기준 | 사용자 경험 |
| --- | --- | --- |
| EAS optional | `EAS_UPDATE_POLICY=optional`로 배포된 OTA 업데이트 | 자동으로 강제하지 않고 앱정보 화면에서 수동 확인/적용 |
| EAS required | `EAS_UPDATE_POLICY=required`로 배포된 OTA 업데이트 | 앱 실행 중 필수 업데이트 모달 표시, 적용 전까지 앱 사용 차단 |
| Store optional | 정책 API의 `latestBuildVersion`이 현재 build code보다 큼 | 앱정보 화면에서 스토어 이동 버튼 표시 |
| Store required | 정책 API의 `minimumBuildVersion`이 현재 build code보다 큼 | 앱 실행 중 필수 업데이트 모달 표시, 스토어 이동 전까지 앱 사용 차단 |

## 구현 위치

| 영역 | 파일 | 역할 |
| --- | --- | --- |
| OTA 배포 메타 | `app.config.ts` | `EAS_UPDATE_POLICY`, `EAS_UPDATE_MESSAGE`, API URL 주입 |
| 필수 업데이트 게이트 | `components/AppUpdateGate.tsx` | required EAS/Store 업데이트만 앱 실행을 차단 |
| 수동 업데이트 화면 | `app/(score)/app-info.tsx` | 현재 버전, 최신 버전, version code, 수동 업데이트 버튼 표시 |
| 정책 API 호출 | `common/api/app-version.ts` | `/app/version-policy` 조회 |

## 운영 규칙

1. JS/화면 수정만 빠르게 반영할 때는 `npm run eas:update:production`을 사용한다.
2. 앱 실행을 막아야 하는 치명 버그 수정은 `npm run eas:update:production:required`를 사용한다.
3. 네이티브 모듈, 권한, `app.json`, version code 변경은 AAB 빌드 후 Play Console에 올린다.
4. AAB 배포 후에는 백엔드 정책 API의 `latestBuildVersion`과 필요 시 `minimumBuildVersion`을 갱신한다.
5. 사용자가 `나중에 하기`를 선택할 수 있는 업데이트는 자동 다운로드하지 않고 앱정보 화면에서 수동으로 진행한다.

## 검증 체크리스트

- `npx tsc --noEmit`
- required EAS 업데이트는 앱 실행을 차단한다.
- optional EAS 업데이트는 앱정보 화면에서만 업데이트 버튼이 활성화된다.
- store required 업데이트는 스토어 이동 버튼 외에 앱 기능 접근을 막는다.
- 현재 버전은 `v1.0.0 (9)`처럼 앱 버전과 version code를 함께 표시한다.
