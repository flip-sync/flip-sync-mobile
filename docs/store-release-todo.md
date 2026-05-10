# FlipSync Google Play 출시 체크리스트

이 문서는 `FlipSync` Android 앱을 Google Play에 올리기 전에 확인해야 할 항목을 순서대로 정리한 체크리스트입니다.

## 1. 빌드 기본값 확인

- [ ] 패키지명이 `com.fliplyze.flipsync`인지 확인한다.
- [ ] 앱 버전(`version`)과 Android `versionCode`를 확인한다.
- [ ] 프로덕션 API 주소가 `https://fliplyze.com/mob`로 설정되어 있는지 확인한다.
- [ ] 권한 문구가 정상 한국어로 보이는지 확인한다.

## 2. AAB 빌드 준비

- [ ] `npm install` 또는 팀 표준 패키지 설치 명령으로 의존성을 정리한다.
- [ ] `npx expo config --json`으로 최종 Expo 설정을 확인한다.
- [ ] `npx eas-cli whoami`로 Expo 계정 로그인 상태를 확인한다.
- [ ] `npm run eas:build:android`로 프로덕션 AAB 빌드를 생성한다.

## 3. Play Console 앱 생성

- [ ] 앱 이름을 `FlipSync`로 생성한다.
- [ ] 앱 유형을 `App`으로 선택한다.
- [ ] 유/무료 여부를 결정한다.
- [ ] 사용자 문의용 이메일을 등록한다.
- [ ] Play App Signing 약관을 수락한다.

## 4. 스토어 리스팅 입력

- [ ] 앱 이름 30자 이하
- [ ] 짧은 설명 80자 이하
- [ ] 전체 설명 4000자 이하
- [ ] 앱 아이콘 512x512 PNG
- [ ] 피처 그래픽 1024x500
- [ ] 휴대폰 스크린샷 최소 2장

초안 문구는 [D:\codex\flip-sync\flip-sync-mobile\docs\store-submission-draft.md](D:/codex/flip-sync/flip-sync-mobile/docs/store-submission-draft.md)에 정리합니다.

## 5. 공개 URL 점검

- [ ] 개인정보처리방침 URL
  - `https://fliplyze.com/mob/legal/privacy-policy`
- [ ] 계정 삭제 안내 URL
  - `https://fliplyze.com/mob/legal/account-deletion`
- [ ] 지원 URL
  - `https://fliplyze.com/mob/support`
- [ ] 위 URL이 모바일 브라우저에서 실제로 열리는지 확인한다.

## 6. 앱 접근 심사 정보 준비

- [ ] 심사용 테스트 계정을 만든다.
- [ ] 테스트 계정이 로그인부터 주요 기능까지 모두 접근 가능한지 확인한다.
- [ ] 심사용 로그인 절차를 한글/영문으로 짧게 정리한다.
- [ ] OTP, 이메일 인증, 관리자 승인 같은 추가 진입 조건이 있으면 우회 방법 또는 테스트용 절차를 준비한다.

## 7. 정책/설문 입력

- [ ] Data safety 작성
- [ ] App access 작성
- [ ] 콘텐츠 등급 설문 작성
- [ ] 광고 사용 여부 선언
- [ ] 타깃 연령층 및 아동 대상 여부 선언

Data safety 초안은 [D:\codex\flip-sync\flip-sync-mobile\docs\google-play-data-safety-draft.md](D:/codex/flip-sync/flip-sync-mobile/docs/google-play-data-safety-draft.md)에 정리합니다.

## 8. 계정 삭제 정책 확인

- [ ] 앱 안에서 계정 삭제 진입이 가능한지 확인한다.
- [ ] 계정 삭제 후 세션이 정리되는지 확인한다.
- [ ] 계정 삭제 정책 설명과 실제 동작이 일치하는지 확인한다.

## 9. 테스트 트랙 배포

- [ ] Internal testing 또는 Closed testing에 먼저 업로드한다.
- [ ] 개인 개발자 계정이라면 생산 배포 전 `12명 이상 / 14일 이상` Closed test 요건이 필요한지 Play Console에서 확인한다.
- [ ] 테스트 피드백을 반영하고 새 빌드를 다시 올린다.

Closed test 운영 문안은 [D:\codex\flip-sync\flip-sync-mobile\docs\google-play-closed-test-plan.md](D:/codex/flip-sync/flip-sync-mobile/docs/google-play-closed-test-plan.md)에 정리합니다.

## 10. 최종 출시 전 확인

- [ ] 로그인
- [ ] 회원가입
- [ ] 이메일 인증
- [ ] 조직 선택
- [ ] 악보 업로드
- [ ] 프로필 수정
- [ ] 계정 삭제
- [ ] 개인정보처리방침 / 계정 삭제 / 지원 페이지 진입

## 11. 프로덕션 제출

- [ ] Production release 생성
- [ ] 국가/배포 대상 설정
- [ ] 심사 노트 입력
- [ ] 초안 저장 후 최종 검토
- [ ] 제출
