# CordiaEC 작업 현황

> 2026-06-11: TODO 4건 + 이중언어(KOR/ENG + DeepL 자동번역) 구현 완료.

## ✅ 완료된 작업

1. **페이지 전환 애니메이션** — 라우트 변경 시 0.28초 페이드인+상승 (CSS만 사용)
2. **히어로 캐러셀** — `hero_slides` 테이블 + admin "히어로" 메뉴 (슬라이드 CRUD, 이미지 업로드, 순서 변경, 활성 토글, 전환 간격 설정). 홈 첫 화면이 자동 전환 슬라이드로 교체됨 (이전/일시정지/다음 + 인덱스 표시)
3. **팝업 안내창** — `popups` 테이블 + admin "팝업" 메뉴 (위치 5종/크기/게시 시작·종료 일시/활성 토글/이미지/링크). 홈에서 게시 기간 내 팝업 표시 + "오늘 하루 보지 않기"
4. **백업 자동화** — `.github/workflows/backup.yml` 주 1회(월요일 KST 오전 9시) 전체 테이블 JSON을 `backups/`에 자동 커밋

## ⚠️ 백업 활성화에 필요한 1회성 설정 (사용자 작업)

GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret:

| Secret 이름 | 값 |
|---|---|
| `SUPABASE_URL` | `https://pjgywtpysimaywlaaymj.supabase.co` |
| `SUPABASE_ANON_KEY` | anon key (.env.local과 동일 값) |
| `SUPABASE_SERVICE_ROLE_KEY` | (선택) Supabase 대시보드 → Settings → API → service_role. 등록해야 contacts(문의 개인정보)까지 백업됨 |

등록 후 GitHub → Actions 탭 → "Weekly Supabase Backup" → Run workflow로 수동 테스트 1회 권장.

## ⚠️ 이중언어 활성화에 필요한 1회성 설정 (사용자 작업)

1. [DeepL API Free](https://www.deepl.com/pro-api) 가입 (무료, 월 50만 자) → API 키 발급
2. Vercel → Settings → Environment Variables → `DEEPL_API_KEY` 추가 → Redeploy
3. 키 등록 전에도 사이트·KOR/ENG 토글은 정상 작동 (자동 번역 버튼만 비활성 에러)

## 남은 아이디어 (미착수)

- 도메인 연결 (Vercel → Settings → Domains)
- 코드 스플리팅으로 초기 로딩 개선 (번들 700KB 경고 — 동작엔 문제 없음)

## 재개 시 컨텍스트 메모

- DB 접근은 전부 `client/src/lib/queries.ts`, 타입은 `database.types.ts`
- DB 스키마: `supabase/migration.sql`(최초) + `supabase/2026-06-11_hero_popups.sql`(증분). **migration.sql 전체 재실행 금지** (데이터 삭제됨)
- 새 테이블은 Supabase MCP(apply_migration)로 직접 적용 가능 (project_id: `pjgywtpysimaywlaaymj`)
- admin 메뉴 추가: `pages/Admin.tsx`의 MENU 배열 + `components/admin/` 탭 컴포넌트
- 브랜드 색상은 `index.css` 수제 클래스 (`bg-cordia-teal` 등) — 그라데이션/투명도 변형 없음 주의
- 배포: push → Vercel 자동. 환경변수 변경 시만 수동 Redeploy
