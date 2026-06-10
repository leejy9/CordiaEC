# CordiaEC 프로젝트 인수인계

## 프로젝트 개요

**CordiaEC** — 한인 디아스포라 비즈니스 플랫폼. 6개 이니셔티브(K-Food, K-Beauty, 스타트업, VC 매칭, 인턴십, 포럼)를 소개하고, 뉴스·연혁·게시글을 관리하는 공개 웹사이트입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 18 + TypeScript + Vite |
| 스타일링 | Tailwind CSS + shadcn/ui (Radix UI) |
| 라우팅 | wouter |
| 상태 관리 | TanStack Query (React Query v5) |
| 폼 | React Hook Form + Zod |
| 백엔드 | Supabase (PostgreSQL + Auth) |
| 파일 스토리지 | Supabase Storage |
| 배포 | Vercel (정적 사이트) |

## 구조

```
src/
├── pages/           # 라우트별 페이지 (7개 공개 + 1개 admin)
├── components/      # UI 컴포넌트 + admin 관리 탭
├── hooks/           # useAuth, use-toast 등
└── lib/
    ├── supabase.ts      # Supabase 클라이언트
    ├── queries.ts       # 전체 DB CRUD + 이미지 업로드
    ├── database.types.ts # 타입 정의
    └── ...

supabase/
└── migration.sql    # 테이블 + RLS + 시드 데이터 (한 번만 실행)

vercel.json         # SPA 라우팅 + keep-alive cron
api/
└── keepalive.ts    # 3일마다 Supabase 자동정지 방지
```

## 핵심 파일

- **pages/Admin.tsx** — 관리자 로그인 + 5개 탭 (게시글, 이니셔티브, 연혁, 홈, 문의)
- **components/admin/** — 각 탭 구현
- **lib/queries.ts** — 모든 DB 쿼리 함수 (CRUD + 이미지 업로드/삭제)
- **supabase/migration.sql** — DB 스키마 + 권한 정책 (RLS)

## 데이터 모델

| 테이블 | 설명 |
|--------|------|
| `initiatives` | 6개 이니셔티브 (고정, 내용만 수정) |
| `posts` | 뉴스 + K-Diaspora 게시글 (통합 테이블, `board` 컬럼으로 구분) |
| `milestones` | About 연혁 |
| `site_settings` | 홈 게시판 섹션 제목·노출건수 (key-value) |
| `contacts` | Contact 폼 제출 |
| Storage `post-images` | 게시글 이미지 (WebP 압축) |

## 권한 (RLS)

- **비로그인**: initiatives/posts/milestones/site_settings 읽기만, contacts 제출만
- **관리자** (Supabase Auth): 모든 데이터 읽기/쓰기/삭제
- Storage: 비로그인 읽기, 관리자만 업로드/삭제

## 로컬 실행

```bash
npm install
npm run dev  # http://localhost:5173
```

## 배포

1. GitHub에 푸시
2. Vercel에서 저장소 연결
3. 환경변수 설정:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 자동 배포

**상세 가이드**: [DEPLOYMENT.md](DEPLOYMENT.md)

## 주요 기능

- **공개 페이지** (7개): Home, About, Initiatives(목록/상세), News, K-Diaspora, Contact
- **Admin 패널** (/admin):
  - 게시글 CRUD (뉴스 + K-Diaspora 통합)
  - 이니셔티브 내용 수정
  - 연혁 CRUD + 순서 변경
  - 홈 게시판 제목·노출건수 설정
  - 문의 열람·삭제
- **이미지 업로드**: 브라우저에서 리사이즈(1600px) + WebP 압축 → Storage 저장

## 보안

✅ **비밀번호 코드 내 미포함** — Supabase Auth 사용  
✅ **무인증 API 제거** — RLS로 권한 강제  
✅ **SQL 인젝션 방지** — supabase-js 파라미터 바인딩  
✅ **개인정보 보호** — contacts 테이블은 비로그인이 조회 불가 (RLS)  
✅ **HTTPS 강제** — Vercel에서 자동 제공

## 운영 팁

- **Supabase 자동정지 방지**: Vercel Cron이 3일마다 `/api/keepalive` 호출
- **이미지 관리**: Storage에서 고아 파일이 생기지 않도록 게시글 삭제 시 이미지도 자동 삭제
- **홈 게시판**: `is_pinned_home=true`인 글이 먼저 노출됨
- **카테고리**: 뉴스의 `initiative_slug`가 이니셔티브 페이지에 자동 연결

## 변경 이력

| 단계 | 내용 |
|------|------|
| 1단계 | Supabase 기반 구축 (테이블 + RLS + Storage) |
| 2단계 | 공개 페이지를 DB 연결로 전환 |
| 3단계 | Admin 재구성 (Auth + 5개 탭) |
| 4단계 | 정리 & Vercel 배포 준비 |

---

*최종 업데이트: 2026년 6월*
