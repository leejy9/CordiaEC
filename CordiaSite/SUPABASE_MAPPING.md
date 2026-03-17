# Supabase 데이터베이스 매핑 및 연동 가이드

## 📋 목차
1. [데이터베이스 구조](#데이터베이스-구조)
2. [테이블별 매핑](#테이블별-매핑)
3. [API 엔드포인트](#api-엔드포인트)
4. [테스트 데이터 적재](#테스트-데이터-적재)
5. [연동 검증](#연동-검증)

---

## 데이터베이스 구조

### Supabase PostgreSQL 데이터베이스 연결 설정

**연결점**: `server/storage.ts` → Drizzle ORM → Supabase PostgreSQL
```typescript
const DATABASE_URL = process.env.DATABASE_URL
const sql = postgres(DATABASE_URL)
const db = drizzle(sql)
```

**환경 변수 설정**:
```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
```

---

## 테이블별 매핑

### 1️⃣ Contacts 테이블 (`contacts`)
**목적**: 사용자 문의 양식 저장

| 필드명 | 데이터타입 | 설명 | 소스 | 사용처 |
|--------|-----------|------|------|--------|
| `id` | UUID | 자동 생성 고유ID | 자동 | 기본키 |
| `name` | text | 문의자 이름 | ContactForm | 관리 |
| `email` | text | 문의자 이메일 | ContactForm | 회신 |
| `message` | text | 문의 내용 | ContactForm | 관리 대시보드 |
| `created_at` | timestamp | 생성 시간 | 자동 (defaultNow) | 정렬 |

**코드 연결**:
- **Frontend**: `client/src/components/modals/ContactModal.tsx` → 폼 제출
- **API**: `POST /api/contacts` (server/routes.ts)
- **Storage**: `storage.createContact(data)` (server/storage.ts)

**쿼리 예시**:
```sql
INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)
RETURNING *;
```

---

### 2️⃣ News Articles 테이블 (`news_articles`)
**목적**: 뉴스 및 공지사항 저장 및 조회

| 필드명 | 데이터타입 | 설명 | 사용처 |
|--------|-----------|------|--------|
| `id` | UUID | 자동 생성 고유ID | 기본키 |
| `title` | text | 뉴스 제목 | News 카드 제목 |
| `content` | text | 뉴스 본문 | NewsModal에서 상세 표시 |
| `excerpt` | text | 요약 텍스트 | News 카드 preview |
| `published_date` | timestamp | 발행일 | 정렬 (최신순) |
| `image_url` | text (nullable) | 썸네일 이미지 | News 카드 배경 |

**코드 연결**:
- **Frontend**: `client/src/pages/News.tsx` → 뉴스 목록 표시
- **API**: 
  - `GET /api/news?page=1&limit=10` (페이징 조회)
  - `GET /api/news/:id` (상세 조회)
- **Storage**: `storage.getNewsArticles(page, limit)` (server/storage.ts)

**쿼리 예시**:
```sql
SELECT * FROM news_articles 
ORDER BY published_date DESC 
LIMIT 10 OFFSET 0;
```

**React Query 사용**:
```typescript
const { data: newsData } = useQuery({
  queryKey: ["/api/news", currentPage, limit],
  queryFn: async () => {
    const response = await fetch(`/api/news?page=${currentPage}&limit=${limit}`);
    return response.json(); // { articles: [], total: 0 }
  }
});
```

---

### 3️⃣ Initiatives 테이블 (`initiatives`)
**목적**: 프로젝트/이니셔티브 정보 저장

| 필드명 | 데이터타입 | 설명 | 사용처 |
|--------|-----------|------|--------|
| `id` | UUID | 자동 생성 고유ID | 기본키 |
| `slug` | text (unique) | URL 경로 | 라우팅 (e.g., `/initiatives/k-food`) |
| `title` | text | 프로젝트명 | 카드 제목 |
| `description` | text | 한줄 설명 | 카드 설명 |
| `content` | text | 상세 내용 | InitiativeModal에 표시 |
| `image_url` | text (nullable) | 프로젝트 이미지 | 카드 배경 이미지 |
| `category` | text | 카테고리 분류 | 필터링 (Food & Beverage, Beauty, 등) |

**코드 연결**:
- **Frontend**: `client/src/pages/Initiatives.tsx` → **⚠️ 현재는 하드코딩된 데이터 사용**
- **API 구현됨**: 
  - `GET /api/initiatives` (전체 목록)
  - `GET /api/initiatives/:slug` (상세 조회)
- **Storage**: `storage.getInitiatives()`, `storage.getInitiative(slug)` (server/storage.ts)

**현재 이니셔티브 목록**:
- `k-food`: K-Food Initiative
- `k-beauty`: K-Beauty Initiative
- `startups`: Startups Program
- `vc-matching`: VC Matching
- `internships`: Internships Program
- `forums`: Global Summit

**⚠️ TODO**: Initiatives를 DB에서 로드하도록 수정

---

### 4️⃣ Research Papers 테이블 (`research_papers`)
**목적**: 연구 논문 저장 (현재 미사용)

| 필드명 | 데이터타입 | 설명 |
|--------|-----------|------|
| `id` | UUID | 자동 생성 고유ID |
| `title` | text | 논문 제목 |
| `description` | text | 요약 |
| `content` | text | 본문 |
| `published_date` | timestamp | 발행일 |
| `views` | integer | 조회수 |
| `downloads` | integer | 다운로드수 |
| `author` | text | 저자 |

**상태**: API는 구현되어 있으나, UI에서 사용되지 않음

---

## API 엔드포인트

### Contact 폼 (POST)
```http
POST /api/contacts
Content-Type: application/json

{
  "name": "김철수",
  "email": "kim@example.com",
  "message": "K-Food 사업에 대해 상담받고 싶습니다."
}

Response:
{
  "success": true,
  "contact": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "김철수",
    "email": "kim@example.com",
    "message": "K-Food 사업에 대해 상담받고 싶습니다.",
    "createdAt": "2024-03-17T10:30:00Z"
  }
}
```

### 뉴스 조회 (GET with Pagination)
```http
GET /api/news?page=1&limit=10

Response:
{
  "articles": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Cordia K-Food Initiative 성공적으로 출범",
      "content": "...",
      "excerpt": "...",
      "publishedDate": "2024-03-15T00:00:00Z",
      "imageUrl": "https://..."
    }
  ],
  "total": 4
}
```

### 뉴스 상세 조회 (GET)
```http
GET /api/news/:id

Response:
{
  "success": true,
  "article": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "...",
    "content": "...",
    "excerpt": "...",
    "publishedDate": "...",
    "imageUrl": "..."
  }
}
```

### 이니셔티브 목록 (GET)
```http
GET /api/initiatives

Response:
{
  "success": true,
  "initiatives": [
    {
      "id": "550e8400...",
      "slug": "k-food",
      "title": "K-Food Initiative",
      "description": "...",
      "content": "...",
      "imageUrl": "...",
      "category": "Food & Beverage"
    }
  ]
}
```

### 이니셔티브 상세 조회 (GET)
```http
GET /api/initiatives/:slug

Response:
{
  "success": true,
  "initiative": {
    "id": "550e8400...",
    "slug": "k-food",
    "title": "K-Food Initiative",
    "description": "...",
    "content": "...",
    "imageUrl": "...",
    "category": "Food & Beverage"
  }
}
```

---

## 테스트 데이터 적재

### 준비 단계

1. **Supabase 프로젝트 생성 및 DATABASE_URL 확보**
   - https://supabase.com/dashboard/projects
   - Database → Connection String 복사

2. **.env 파일 생성**
   ```bash
   DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[HOST]:[PORT]/postgres
   ```

3. **의존성 설치**
   ```bash
   npm install
   ```

4. **DB 스키마 생성 (Drizzle CLI)**
   ```bash
   npm run db:push
   ```
   이 명령어는 `shared/schema.ts`의 테이블을 Supabase에 생성합니다.

### 테스트 데이터 삽입

```bash
npm run db:seed
```

**삽입되는 데이터**:
- ✅ 2개 Contacts (문의 양식 샘플)
- ✅ 4개 News Articles (뉴스 샘플)
- ✅ 6개 Initiatives (프로젝트 샘플)
- ✅ 2개 Research Papers (논문 샘플)

### seed.ts 파일 위치
`CordiaEC/seed.ts`

---

## 연동 검증

### 1️⃣ 로컬 개발 서버 실행
```bash
npm run dev
```

### 2️⃣ API 테스트

#### Contact 폼 제출 테스트
```bash
curl -X POST http://localhost:5000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트사용자",
    "email": "test@example.com",
    "message": "테스트 메시지"
  }'
```

**예상 응답**:
```json
{
  "success": true,
  "contact": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "테스트사용자",
    "email": "test@example.com",
    "message": "테스트 메시지",
    "createdAt": "2024-03-17T10:30:00Z"
  }
}
```

#### 뉴스 조회 테스트
```bash
curl http://localhost:5000/api/news?page=1&limit=10
```

**예상 응답**:
```json
{
  "articles": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Cordia K-Food Initiative 성공적으로 출범",
      "content": "...",
      "excerpt": "한국 식품 브랜드의 글로벌 확장을 지원하는 새로운 이니셔티브 출범",
      "publishedDate": "2024-03-15T00:00:00Z",
      "imageUrl": "https://..."
    }
  ],
  "total": 4
}
```

#### Initiatives 조회 테스트
```bash
curl http://localhost:5000/api/initiatives
```

#### 특정 Initiative 조회 테스트
```bash
curl http://localhost:5000/api/initiatives/k-food
```

### 3️⃣ 브라우저에서 확인

1. **뉴스 페이지**: http://localhost:5173/news
   - 시드 데이터의 4개 뉴스가 카드로 표시되어야 함

2. **이니셔티브 페이지**: http://localhost:5173/initiatives
   - 6개 이니셔티브가 카드로 표시되어야 함

3. **연락처 페이지**: http://localhost:5173/contact
   - Contact Form을 작성하고 제출 시 DB에 저장되어야 함

### 4️⃣ Supabase 대시보드에서 직접 확인

1. Supabase 대시보드 열기
2. SQL Editor 또는 Table Editor에서 데이터 확인:
   ```sql
   SELECT * FROM contacts;
   SELECT * FROM news_articles;
   SELECT * FROM initiatives;
   ```

---

## 🔍 연동 상태 요약

| 테이블 | API | UI 구현 | DB 연결 | 상태 |
|--------|-----|--------|--------|------|
| **contacts** | ✅ POST /api/contacts | ✅ ContactModal | ✅ Drizzle ORM | ✅ 완전 연동 |
| **news_articles** | ✅ GET /api/news | ✅ News.tsx | ✅ Drizzle ORM | ✅ 완전 연동 |
| **initiatives** | ✅ GET /api/initiatives | ⚠️ 하드코딩 사용 | ✅ API 준비됨 | ⚠️ 부분 연동 |
| **research_papers** | ✅ GET (미구현) | ❌ 미사용 | ✅ API 준비됨 | ❌ 미사용 |

---

## 📝 다음 단계

### 우선순위
1. ✅ Contacts, News, Initiatives 테스트 데이터 삽입
2. ✅ 로컬에서 API 연동 테스트
3. ⬜ Initiatives를 하드코딩에서 API 조회로 수정 (선택사항)
4. ⬜ Research Papers 페이지 UI 구현 (선택사항)

### 프로덕션 배포 전 체크리스트
- [ ] DATABASE_URL이 Supabase 프로덕션 환경으로 설정됨
- [ ] npm run db:push로 프로덕션 DB 스키마 생성
- [ ] npm run db:seed로 프로덕션 테스트 데이터 삽입
- [ ] 모든 API 엔드포인트 테스트 완료
- [ ] CORS 설정 확인 (필요 시)

---

**작성일**: 2024-03-17
**마지막 수정**: 2024-03-17
