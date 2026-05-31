# Phase 2 Korean Copy Sweep

작성일: 2026-05-28

## 목적

앱 화면에 표시되는 한글 문구가 mojibake 형태로 깨져 저장된 곳이 있는지 확인한다.

## 점검 범위

- `app/**/*.ts`
- `app/**/*.tsx`
- `components/**/*.ts`
- `components/**/*.tsx`
- `common/**/*.ts`
- `api/**/*.ts`
- `hooks/**/*.ts`
- `*.json`
- `docs/**/*.md`

## 점검 결과

소스 파일에는 깨진 한글 패턴이 발견되지 않았다. PowerShell `Get-Content` 출력에서 일부 한글이 깨져 보이는 현상은 콘솔 출력 인코딩 문제이며, 실제 파일은 UTF-8 한글 또는 Unicode escape 형태로 저장되어 있다.

대표 확인:

- `app.json`의 `photosPermission`은 실제 파일에서 `프로필 사진과 악보 이미지를 업로드하려면 사진 보관함 접근 권한이 필요합니다.`로 저장되어 있다.
- `app/(score)/app-info.tsx`의 앱정보 링크 문구는 실제 파일에서 `개인정보처리방침`, `계정삭제 안내`, `고객 지원`으로 저장되어 있다.

## 재점검 명령

```bash
node -e "const fs=require('fs'); const path=require('path'); const root=process.cwd(); const exts=new Set(['.ts','.tsx','.json','.md']); const ignore=new Set(['node_modules','.expo','android','ios','.git','dist','build']); const bad=/[\\uFFFD\\uF900-\\uFAFF]|[怨蹂媛寃臾諛遺瑜湲嫄]/; function walk(dir){ for(const ent of fs.readdirSync(dir,{withFileTypes:true})){ if(ignore.has(ent.name)) continue; const p=path.join(dir,ent.name); if(ent.isDirectory()) walk(p); else if(exts.has(path.extname(ent.name))){ const txt=fs.readFileSync(p,'utf8'); if(bad.test(txt)) console.log(path.relative(root,p)); } } } walk(root);"
```
