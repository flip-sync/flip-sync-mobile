# Phase 2 Release Decision

작성일: 2026-05-28

## 결론

Phase 2 변경은 네이티브 의존성 추가나 `app.json` 네이티브 설정 변경이 없으므로 AAB 재빌드 없이 EAS Update로 반영할 수 있다.

다만 현재 워킹트리에 Phase 2 이전부터 이어진 미커밋 변경이 함께 존재한다. 지금 `eas update`를 실행하면 아래 변경이 모두 한 번에 배포되므로, 실제 발행은 변경 범위 확인 후 진행하는 것이 안전하다.

## 배포 방식

| 조건 | 선택 |
| --- | --- |
| JS/TS 화면, API 호출, 스타일 변경만 포함 | EAS Update |
| 네이티브 모듈 추가, 권한 변경, 딥링크/아이콘/스플래시 변경 | AAB build 후 Play Console 업로드 |
| 필수 업데이트가 필요한 치명 버그 | required EAS Update 또는 `minimumBuildVersion` 상향 |

## 현재 판단

- `npx tsc --noEmit` 통과
- Phase 2에서 새 네이티브 패키지 추가 없음
- Phase 2에서 `app.json`, `eas.json`, Android/iOS native 파일 변경 없음
- 배포 가능 방식: EAS Update
- 실제 배포 상태: 보류

## 보류 이유

현재 `git status` 기준으로 기존 변경과 Phase 2 변경이 섞여 있다. 배포 전에는 다음 중 하나를 선택한다.

1. 현재 워킹트리 전체를 의도한 릴리스로 보고 EAS Update 실행
2. Phase 2 변경만 별도 커밋/브랜치로 정리한 뒤 EAS Update 실행
3. 추가 QA 후 required/optional 정책을 선택해 EAS Update 실행

## 권장 명령

```bash
npm run eas:update:production -- --message "Phase 2 mobile stability improvements"
```

필수 업데이트가 필요할 때:

```bash
npm run eas:update:production:required -- --message "Required stability update"
```
