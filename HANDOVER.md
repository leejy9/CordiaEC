# CordiaEC 프로젝트 인수인계 문서

> 본 문서는 CordiaEC 웹사이트 코드를 인수받는 개발사를 위한 안내서입니다.
> 1차 개발사가 작성하였으며, 코드 구조 / 실행 방법 / 주의사항을 담고 있습니다.

> 해당 웹페이지는 현재 전혀 사용하지 않고 있으며, 개발 단계에서 고객의 의사부재로 중지되었던 프로젝트입니다.
> > 해당 웹페이지 기획/개발 과정에서 전달받은 문서가 전혀 없습니다. 의도나 목표에 대해선 고객과 직접 소통 부탁드립니다.

---

## ⚠️ 중요 공지

**현재 운영 중인 Supabase 데이터베이스 및 Replit 환경은 2026년 5월 10일에 종료될 예정입니다.**

- 그 이후에는 기존 `DATABASE_URL`로 접속이 불가능합니다.
- 인수받는 측에서 **자체 PostgreSQL 데이터베이스와 자체 호스팅 환경을 새로 구축**하여 운영해야 합니다.
- 현재 DB에는 실제 운영 데이터가 들어있지 않으므로, 데이터 이관 작업은 필요하지 않습니다.

---

## 1. 프로젝트 개요

**CordiaEC**는 한인 디아스포라(재외동포) 비즈니스 플랫폼입니다.
한국 기업과 해외 시장을 연결하는 6개 이니셔티브(K-Food, K-Beauty, 스타트업, VC 매칭, 인턴십, 포럼)를 소개하고,
관련 뉴스와 동포 활동 콘텐츠를 게시할 수 있는 공개 정보 사이트입니다.

- **사용자 인증 없음**: 일반 방문자는 로그인 없이 모든 페이지를 열람합니다.
- **관리자 페이지(`/admin`)**: 비밀번호 한 개로 들어가는 단순 보호 영역. 뉴스/동포 게시물/연구 자료를 등록·수정·삭제합니다.
- **문의 폼**: Contact 페이지에서 받은 문의는 DB에 저장됩니다.

---

## 2. 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 프론트엔드 | React 18, TypeScript, Vite |
| 라우팅 | wouter |
| 상태 관리 | TanStack Query (React Query v5) |
| 폼 | React Hook Form + Zod |
| UI | Tailwind CSS + shadcn/ui (Radix UI 기반) |
| 아이콘 | lucide-react, react-icons |
| 백엔드 | Express.js, TypeScript, tsx (개발 시) |
| ORM | Drizzle ORM |
| DB | PostgreSQL (현재는 Supabase 호스팅, 변경 가능) |

프론트엔드와 백엔드가 **하나의 Express 서버에서 같은 포트(기본 5000)** 로 서비스됩니다.
Vite는 개발 모드에서만 미들웨어로 동작하고, 프로덕션은 `npm run build`로 빌드된 정적 파일을 Express가 서빙합니다.

---

## 3. 폴더 구조

```
cordiaec/
├── client/                 # 프론트엔드 (React + Vite)
│   └── src/
│       ├── pages/          # 라우트별 페이지 (Home, About, News, Admin 등)
│       ├── components/     # 공용 컴포넌트, 레이아웃, shadcn/ui
│       ├── lib/            # initiativesData, queryClient, 유틸 함수
│       └── hooks/          # use-toast 등 커스텀 훅
├── server/                 # 백엔드 (Express)
│   ├── index.ts            # 서버 진입점
│   ├── routes.ts           # REST API 정의
│   ├── storage.ts          # DB 액세스 계층 (MemStorage / PostgreSQLStorage)
│   └── vite.ts             # Vite 미들웨어 통합 (수정 금지 권장)
├── shared/
│   └── schema.ts           # ★ Drizzle 테이블 + Zod 스키마 (프론트/백엔드 공용)
├── attached_assets/        # 사이트에서 사용하는 이미지·자산
├── drizzle.config.ts       # Drizzle 설정 (수정 금지 권장)
├── vite.config.ts          # Vite 설정 (수정 금지 권장)
├── package.json
├── DEPLOYMENT.md           # 외부 배포(Vercel, Railway 등) 안내
└── replit.md               # 아키텍처 메모 (참고용)
```

### 핵심 파일 우선순위

처음 코드를 받으셨다면 다음 순서로 보시면 빠르게 파악됩니다.

1. **`shared/schema.ts`** — 모든 데이터 모델의 단일 출처
2. **`server/storage.ts`** — DB CRUD 인터페이스
3. **`server/routes.ts`** — REST API 엔드포인트
4. **`client/src/App.tsx`** — 라우팅 정의
5. **`client/src/pages/`** — 각 페이지 구현

---

## 4. 로컬 실행 방법

### 4.1 사전 요구사항
- Node.js 20 이상
- PostgreSQL 데이터베이스 (로컬 또는 Supabase / Neon / Railway 등)

### 4.2 설정 절차

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 DATABASE_URL을 본인 DB의 연결 문자열로 교체

# 3. DB 스키마 생성 (테이블 자동 생성)
npm run db:push

# 4. 개발 서버 실행
npm run dev
```

이후 브라우저에서 `http://localhost:5000` 접속.

### 4.3 프로덕션 빌드

```bash
npm run build   # 클라이언트 + 서버 빌드
npm start       # 빌드된 서버 실행
```

---

## 5. 환경 변수

| 변수명 | 필수 | 설명 |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL 연결 문자열. Supabase 사용 시 Pooler URL 권장. |
| `NODE_ENV` | 선택 | `development` / `production` |
| `PORT` | 선택 | 기본 5000 |

`.env.example` 파일에 형식 예시가 있습니다. 절대 `.env` 파일을 Git에 커밋하지 마세요.

---

## 6. 데이터베이스

### 6.1 테이블 구조 (`shared/schema.ts` 참조)

| 테이블 | 용도 |
| --- | --- |
| `contacts` | Contact 페이지 문의 저장 |
| `news_articles` | 뉴스 기사 (선택적 `category`로 6개 이니셔티브와 연결) |
| `research_papers` | 연구 자료 (조회수/다운로드수 트래킹) |
| `overseas_korean_posts` | 재외동포(K-Diaspora) 게시물 |

모든 테이블은 **UUID PK**를 사용합니다.

### 6.2 마이그레이션 방식

이 프로젝트는 **SQL 마이그레이션 파일을 직접 작성하지 않습니다.**
Drizzle Kit의 `push` 방식을 사용합니다.

```bash
npm run db:push           # 스키마 변경을 DB에 적용
npm run db:push -- --force  # 데이터 손실 경고가 나도 강제 적용
```

스키마를 바꾸려면 `shared/schema.ts`를 수정한 뒤 `npm run db:push`만 실행하면 됩니다.

### 6.3 이니셔티브 데이터

6개 이니셔티브(K-Food, K-Beauty, 스타트업, VC 매칭, 인턴십, 포럼)는 **DB가 아닌 코드(`client/src/lib/initiativesData.ts`)에 하드코딩**되어 있습니다.
각 이니셔티브 페이지에 표시되는 관련 뉴스는 `news_articles.category` 값이 해당 이니셔티브 슬러그와 일치하는 글을 자동으로 가져옵니다.

이니셔티브의 제목·소개·본문 등을 바꾸려면 `initiativesData.ts`를 직접 수정해야 합니다.

---

## 7. 관리자 페이지

- **경로**: `/admin`
- **현재 비밀번호**: 코드에 하드코딩되어 있습니다 (`client/src/pages/Admin.tsx`의 `ADMIN_PASSWORD` 상수).
- **cordia2025**

### 권장 보안 개선 사항 (2차 개발사 작업 권장)

1. **비밀번호를 환경변수로 분리**: 프론트엔드에 평문으로 두지 말고 백엔드 인증 API로 옮기는 것을 권장.
2. **세션 기반 인증으로 전환**: 현재는 비밀번호만 일치하면 로컬 스토리지에 토큰을 저장하는 구조라 보안에 취약합니다.
3. **HTTPS 강제**: 배포 시 반드시 HTTPS 환경에서 운영.

---

## 8. API 엔드포인트 요약

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `GET` | `/api/news` | 뉴스 목록. `?page`, `?limit`, `?category`, `?search` 지원 |
| `GET` | `/api/news/:id` | 뉴스 단건 조회 |
| `POST` | `/api/news` | 뉴스 생성 (관리자) |
| `PUT` | `/api/news/:id` | 뉴스 수정 (관리자) |
| `DELETE` | `/api/news/:id` | 뉴스 삭제 (관리자) |
| `GET` | `/api/overseas-korean` | 동포 게시물 목록. `?page`, `?limit`, `?search` 지원 |
| `GET` | `/api/overseas-korean/:id` | 동포 게시물 단건 |
| `POST/PUT/DELETE` | `/api/overseas-korean*` | 동포 게시물 CRUD (관리자) |
| `GET/POST` | `/api/research-papers*` | 연구 자료 CRUD |
| `POST` | `/api/contacts` | Contact 폼 제출 |
| `GET` | `/api/contacts` | 문의 목록 (관리자) |

---

*문서 작성일: 2026년 4월 30일*
