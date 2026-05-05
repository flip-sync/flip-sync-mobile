# FlipSync Store Review Checklist

## 이번 변경으로 반영한 항목

- 로그인 화면과 회원가입 화면에 `개인정보처리방침`, `계정 삭제 안내` 진입 링크 추가
- 프로필 수정 화면에서 `회원탈퇴`를 계정 삭제 안내 화면으로 연결
- 앱 내부 공개 라우트 `/legal/privacy-policy`, `/legal/account-deletion` 추가
- `app.json`에 기본 `bundleIdentifier`, `package`, `buildNumber`, `versionCode` 추가
- `expo-image-picker` 권한 문구 추가

## 제출 전에 반드시 확인할 항목

1. 실제 계정 삭제 기능
현재 앱은 로그인 상태에서 비밀번호 확인 후 서버 API로 바로 계정 삭제를 요청하는 흐름이 연결되어 있습니다.
스토어 제출 전에는 운영 환경에서 실제 삭제가 정상 완료되는지 한 번 더 검증해야 합니다.

2. 외부 공개 URL
Play Console과 App Store Connect에는 앱 내부 화면과 별개로 다음 URL이 필요할 수 있습니다.
- 공개 개인정보처리방침 URL
- 계정 삭제 안내 또는 계정 삭제 요청 URL
- 고객 지원 URL

3. 제출용 식별자와 버전
현재 `app.json`은 아래 값을 기본값으로 넣어 둔 상태입니다.
- iOS bundle identifier: `com.fliplyze.flipsync`
- Android package: `com.fliplyze.flipsync`
- iOS build number: `1`
- Android version code: `1`

이미 기존 스토어 앱이나 테스트 빌드가 있다면 실제 식별자와 증가된 버전 번호로 다시 맞춰야 합니다.

4. 심사 메타데이터
- 리뷰어 테스트 계정
- 로그인 이후 진입 경로 설명
- 개인정보 수집 항목 설명
- Data Safety / App Privacy 작성
- App Store Connect 연락처 정보와 전화번호

5. 운영 정책 점검
- 계정 삭제 요청 접수 후 처리 SLA
- 삭제 대상 데이터와 예외 보관 데이터 정의
- 고객 문의 메일 운영 가능 여부
- 조직장 / 방장 탈퇴 시 소유권 이관 정책 확인
