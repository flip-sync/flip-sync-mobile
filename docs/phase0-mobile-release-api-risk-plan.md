# Phase 0 Mobile Release/API Risk Plan

작성일: 2026-05-28  
대상: `flip-sync-mobile`

## 1. 목적

이 문서는 Phase 0에서 모바일 릴리스 안정성과 API 클라이언트 일관성 리스크를 정리하기 위한 범위 산정 문서다. 즉시 대규모 리팩터링을 하지 않고, 배포 안정화 이후 어떤 순서로 모바일 안정성을 개선할지 정한다.

## 2. 현재 리스크

| 리스크 | 영향 | 우선순위 |
| --- | --- | --- |
| `eas.json`의 `requireCommit=false` | 더티 워크트리 상태로 EAS Build/Update 가능 | P1 |
| `runtimeVersion.policy=appVersion` | OTA Update 적용 범위가 앱 버전에 묶임 | P1 |
| `updates.checkAutomatically=NEVER` | update 확인/적용이 앱 내부 구현에 전적으로 의존 | P1 |
| `/app/version-policy` 실패 시 조용히 무시 | 스토어 업데이트 정책 장애를 발견하기 어려움 | P1 |
| axios/fetch API 클라이언트 이원화 | 토큰 재발급, 에러 메시지, 헤더 정책 불일치 | P0 |
| fetch 기반 `apiRequest` refresh/retry 부재 | 일부 API에서 로그인 유지 실패 가능 | P0 |
| WebSocket token refresh 부재 | 토큰 만료 후 재연결 실패 반복 가능 | P1 |
| 일부 한글 copy mojibake | 스토어 심사/사용자 신뢰 저하 | P1 |

## 3. 권장 진행 순서

| 단계 | 작업 | 검증 |
| --- | --- | --- |
| 1 | API 클라이언트 사용처 목록화 | axios/fetch 호출 파일 목록 작성 |
| 2 | refresh token 재발급 로직을 단일 모듈로 분리 | 401 후 1회 재시도 성공 |
| 3 | fetch 기반 `apiRequest`에도 refresh/retry 적용 | 앱 버전/초대/API 호출 정상 |
| 4 | WebSocket 연결 전 access token 갱신 확인 | 만료 토큰 상태에서 재연결 성공 |
| 5 | EAS Update 정책 문서화 | optional/required/store update 구분 |
| 6 | `requireCommit` 운영 정책 결정 | 내부 테스트/프로덕션 기준 분리 |
| 7 | 한글 copy sweep | 주요 화면 mojibake 제거 |

## 4. 변경 후보 파일

| 파일 | 목적 |
| --- | --- |
| `api/interceptors.ts` | axios refresh/retry 정책 기준 |
| `common/api/client.ts` | fetch 기반 API refresh/retry 추가 |
| `common/api/token-storage.ts` 또는 관련 auth 저장소 | 토큰 접근 단일화 |
| `hooks/score/useSharedScoreSync.ts` | WebSocket 연결 전 토큰 갱신 |
| `components/AppUpdateGate.tsx` | 업데이트 정책 실패/필수/선택 처리 |
| `eas.json` | release 안전장치 정책 |
| `app.json`, `app.config.ts` | EAS/Expo runtime/update 설정 |

## 5. Acceptance Checks

| 항목 | 기대 결과 |
| --- | --- |
| TypeScript | `npx tsc --noEmit` 통과 |
| 로그인 유지 | access token 만료 후 refresh로 API 1회 재시도 |
| refresh 실패 | 사용자 세션 정리 후 로그인 화면 이동 |
| 조직 헤더 | 조직 전환 직후 `X-Organization-Id` 최신값 사용 |
| WebSocket | 만료 토큰 상태에서 연결 전 갱신 또는 명확한 로그아웃 |
| EAS Update | optional update는 앱 사용 가능, required update는 차단 |
| Store Update | version code 미달 시 스토어 이동 안내 |

## 6. 결정 필요 사항

| 결정 | 선택지 | 추천 |
| --- | --- | --- |
| API 클라이언트 | axios 중심 / fetch 중심 / 점진 통합 | 점진 통합 |
| EAS `requireCommit` | 항상 true / production만 true / 현재 유지 | production만 true |
| optional update UX | 자동 팝업 / 앱정보 수동 확인 | 앱정보 수동 확인 유지 |
| WebSocket token | query token 유지 / subprotocol/header 대체 | 단기 query 유지, 연결 전 refresh |

