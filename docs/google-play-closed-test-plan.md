# FlipSync Google Play Closed Test 운영안

이 문서는 Google Play Closed test를 운영할 때 사용할 안내 문구와 진행 순서를 정리한 문서입니다.

## 목적

- 앱 기본 기능이 실제 기기에서 안정적으로 동작하는지 확인
- Google Play 정책 검토 전에 로그인, 조직 선택, 악보 업로드, 계정 삭제 흐름 점검
- 개인 개발자 계정의 경우 필요한 테스트 요건 충족 준비

## 권장 테스트 인원

- 최소 12명 이상
- 가능하면 실제 합주/동아리 사용 패턴과 비슷한 사용자 포함

## 권장 테스트 기간

- 최소 14일 연속
- 중간 수정이 있으면 새 빌드 공지 후 재검증 요청

## 테스터에게 보낼 안내 문구 초안

안녕하세요. FlipSync 비공개 테스트에 참여 부탁드립니다.

이번 테스트에서는 아래 항목을 확인해 주세요.

1. 로그인과 회원가입이 정상 동작하는지
2. 조직 선택이 자연스러운지
3. 공유방 진입과 악보 조회가 잘 되는지
4. 악보 이미지 업로드가 문제없이 되는지
5. 프로필 수정과 계정 삭제 안내 경로가 잘 보이는지

문제가 있으면 다음 내용을 함께 보내 주세요.

- 사용 기기
- 발생 시점
- 어떤 화면에서 문제가 생겼는지
- 가능하면 스크린샷 또는 화면 녹화

## 테스터 체크리스트

- [ ] 앱 설치 가능
- [ ] 로그인 가능
- [ ] 조직 선택 가능
- [ ] 공유방 목록 확인 가능
- [ ] 악보 이미지 조회 가능
- [ ] 악보 업로드 가능
- [ ] 프로필 수정 가능
- [ ] 계정 삭제 화면 진입 가능

## 피드백 수집 항목

- 설치나 로그인에서 막히는 부분이 있었는지
- 화면 구성이 이해하기 쉬운지
- 자주 쓰게 될 기능이 어디 있는지 바로 찾을 수 있는지
- 업로드 속도와 조회 속도가 불편하지 않은지
- 앱이 강제 종료되거나 멈춘 적이 있는지

## Play Console 생산 배포 신청 시 요약 예시

### About your closed test 예시

`We ran a closed test with invited users who used the core features of the app on real Android devices. Testers logged in, selected organizations, entered rooms, viewed shared score images, uploaded sample score images, and checked account management flows. Feedback was collected through direct messages and email, and issues found during the test were fixed before preparing the production release.`

### Tester engagement 예시

`Testers used the app in a way that closely matches production usage: signing in, selecting a team space, checking room content, and uploading or viewing shared score materials.`

### Feedback summary 예시

`Most feedback focused on login clarity, room navigation, and score upload convenience. We refined store metadata, legal/support entry points, and account deletion guidance, and confirmed that the main flows work on actual devices.`

## 운영 메모

- 테스트 계정은 심사 전까지 유지합니다.
- 테스트 조직/공유방/샘플 악보는 삭제하지 않는 편이 안전합니다.
- 내부 테스트와 Closed test를 분리해서 운영하면 버전 관리가 편합니다.
