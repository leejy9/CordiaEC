# CordiaEC 다음 작업 목록

> 2026-06-11 기준. 4단계 마이그레이션(Supabase + Vercel) 완료 후 추가 개선 작업.
> 현재 상태: 배포 정상 작동, admin 5개 메뉴(게시글/이니셔티브/연혁/홈 게시판/문의함) 운영 중.

---

## 1. 백업 자동화 ✅ 가능 / 권장

무료 플랜은 자동 백업이 없으므로 직접 만들어야 함.

**방안**: GitHub Actions로 주 1회 자동 백업
- 매주 정해진 시간에 Supabase REST API로 전체 테이블(initiatives, posts, milestones, site_settings, contacts)을 JSON으로 내려받아 저장소의 `backups/` 브랜치에 커밋
- contacts(개인정보) 포함하려면 service_role 키가 필요 → GitHub Actions Secret에만 저장 (코드에 절대 노출 금지)
- Storage 이미지 목록도 함께 기록 (이미지 파일 자체는 용량상 주기적 수동 다운로드 권장)

**작업량**: 작음 (워크플로 파일 1개)

---

## 2. 히어로 캐러셀 (첫 화면 슬라이드) ✅ 가능 / 합리적

참고: K학술확산연구센터 사이트 스타일 — 전체화면 이미지 슬라이드 + 좌하단 큰 제목 + 부가 텍스트 줄들 + 좌측 이전/일시정지/다음 컨트롤 + 슬라이드 번호(2/2).

**검토 결과**: 완전히 가능. 무료 한도 영향 거의 없음 (슬라이드 이미지 몇 장 수준).
외부 라이브러리 없이 React 상태 + CSS 전환만으로 구현 가능.

**구현 설계**:
- 새 테이블 `hero_slides`: id, image_url, headline(큰 제목), sub_lines(부가 텍스트, 줄바꿈 구분), display_order, is_active
- `site_settings`에 `hero_interval` (슬라이드 전환 간격, 초 단위) 추가
- Home 히어로 섹션 교체: n초마다 자동 전환 + 페이드 효과, 이전/다음/일시정지 버튼, 슬라이드 인덱스 표시
- **admin에 "히어로" 메뉴 추가**: 슬라이드 추가/수정/삭제/순서변경, 이미지 업로드(기존 압축 파이프라인 재사용), 제목·텍스트 수정, 전환 간격 설정

**작업량**: 중간 (admin 탭 1개 + 홈 히어로 재구성 + 테이블 1개)
**선행 작업**: Supabase SQL Editor에서 hero_slides 테이블 생성 SQL 실행 필요 (작업 시 SQL 제공)

---

## 3. 팝업 안내창 ✅ 가능 / 합리적 (한국 기관 사이트 표준 기능)

**구현 설계**:
- 새 테이블 `popups`: id, title, content(텍스트), image_url(선택), link_url(클릭 시 이동, 선택),
  position(center / top-left / top-right / bottom-left / bottom-right), width(px),
  starts_at, ends_at, is_active
- 사이트 진입 시 "현재 시각이 게시 기간 내 + 활성화" 인 팝업만 표시
- "오늘 하루 보지 않기" 체크박스 (localStorage로 처리 — 한국 사이트 표준 UX)
- 여러 팝업 동시 게시 가능 (위치 다르게)
- **admin에 "팝업" 메뉴 추가**: CRUD + 게시 일정(시작일시/종료일시) + 위치/크기 설정 + 미리보기

**작업량**: 중간
**선행 작업**: popups 테이블 SQL 실행 필요 (작업 시 제공)

---

## 4. 페이지 전환 애니메이션 ✅ 가능 / 가벼운 작업

"버튼 누르면 0.1초만에 삥 하고 바뀌는" 느낌 → 부드러운 전환감.

**구현 설계**:
- 라우트 변경 시 새 페이지가 **살짝 아래에서 떠오르며 페이드인** (약 0.25~0.3초, CSS만 사용)
- 외부 라이브러리 불필요 (framer-motion 없이 CSS keyframes로 충분 — 번들 크기 영향 0)
- 카드/버튼 호버 전환은 이미 있으므로 페이지 단위만 추가
- 주의: 과하면 오히려 답답해지므로 "은은한 0.25초 페이드 + 8px 상승" 수준 권장

**작업량**: 작음

---

## 권장 작업 순서

| 순서 | 작업 | 이유 |
|---|---|---|
| 1 | ④ 페이지 전환 애니메이션 | 가장 작고 즉시 체감 |
| 2 | ② 히어로 캐러셀 | 첫인상 개선 효과 최대 |
| 3 | ③ 팝업 안내창 | 운영 기능 |
| 4 | ① 백업 자동화 | 콘텐츠가 쌓이기 시작하면 필수 |

## 재개 시 컨텍스트 메모

- 코드: `client/src/` (React+Vite), DB 접근은 전부 `client/src/lib/queries.ts`
- DB 스키마: `supabase/migration.sql` (새 테이블 추가 시 별도 SQL로 제공할 것 — migration.sql 전체 재실행은 기존 데이터 삭제됨 ⚠️)
- admin 메뉴 추가 위치: `client/src/pages/Admin.tsx`의 `MENU` 배열 + `components/admin/`에 탭 컴포넌트
- 이미지 업로드 재사용: `queries.ts`의 `uploadImage()` (1600px 리사이즈 + WebP 압축 + Storage 저장)
- 브랜드 색상은 Tailwind 테마가 아니라 `index.css`의 수제 클래스 (`bg-cordia-teal` 등) — 그라데이션/투명도 변형 클래스는 없음 주의
- 배포: GitHub push → Vercel 자동 배포. 환경변수 변경 시에만 수동 Redeploy
