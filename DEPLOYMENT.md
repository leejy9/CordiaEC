# CordiaEC 외부 배포 가이드

이 문서는 CordiaEC 웹사이트를 GitHub에서 Vercel, Netlify 등 외부 플랫폼에 배포하는 방법을 설명합니다.

## 🚀 배포 전 준비사항

### 1. Supabase 데이터베이스 설정

1. [Supabase 대시보드](https://supabase.com/dashboard/projects)에 접속
2. 새 프로젝트 생성 (기존 프로젝트가 없는 경우)
3. 프로젝트 페이지에서 상단 툴바의 **"Connect"** 버튼 클릭
4. **"Connection string"** → **"Transaction pooler"** 아래의 URI 값 복사
5. `[YOUR-PASSWORD]`를 프로젝트에서 설정한 실제 데이터베이스 비밀번호로 변경

### 2. 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력:

```env
# 필수: Supabase 데이터베이스 URL
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_PROJECT_REF.pooler.supabase.com:6543/postgres?pgbouncer=true

# 애플리케이션 설정
NODE_ENV=production
PORT=5000
```

## 📦 배포 플랫폼별 설정

### Vercel 배포

1. GitHub에 코드 업로드
2. [Vercel](https://vercel.com)에서 GitHub 저장소 연결
3. 환경변수 설정:
   - `DATABASE_URL`: Supabase 연결 문자열
   - `NODE_ENV`: `production`
4. 빌드 명령어: `npm run build`
5. 시작 명령어: `npm start`
6. Root Directory: 프로젝트 루트 디렉토리 선택

### Netlify 배포

1. GitHub에 코드 업로드
2. [Netlify](https://netlify.com)에서 GitHub 저장소 연결  
3. 빌드 설정:
   - Build command: `npm run build`
   - Start command: `npm start`
   - Publish directory: `dist/public`
4. 환경변수 설정:
   - `DATABASE_URL`: Supabase 연결 문자열
   - `NODE_ENV`: `production`

### Railway 배포

1. GitHub에 코드 업로드
2. [Railway](https://railway.app)에서 GitHub 저장소 연결
3. 환경변수 설정:
   - `DATABASE_URL`: Supabase 연결 문자열
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
4. 자동으로 배포됩니다

## 🗄️ 데이터베이스 스키마 설정

**중요: 배포 전에 로컬에서 먼저 실행하세요:**

```bash
# 1. 로컬에서 Supabase 테이블 생성
npm run db:push

# 2. 빌드 테스트
npm run build
```

이 명령어들은 Supabase 데이터베이스에 필요한 테이블들을 생성하고 빌드가 성공하는지 확인합니다.

## ✅ 배포 후 확인사항

1. 웹사이트가 정상적으로 로드되는지 확인
2. Contact 폼 제출 테스트
3. Supabase 대시보드에서 데이터 저장 확인

## 🚀 외부 배포 단계별 가이드

### 단계 1: GitHub Clone 후 초기 설정

GitHub에서 clone 후 첫 번째로 다음 명령어를 실행하세요:

```bash
# Replit 패키지 문제 무시하고 설치
npm install --ignore-scripts --no-optional

# 또는 yarn 사용 시
yarn install --ignore-scripts --ignore-optional
```

### 단계 2: Replit 종속성 제거 (필수)

외부 배포를 위해 **반드시** 다음 수정을 해야 합니다:

#### 2-1. package.json 수정
`package.json` 파일의 `devDependencies` 섹션에서 다음 **2줄을 완전히 삭제**:

```json
"@replit/vite-plugin-cartographer": "^0.2.8",
"@replit/vite-plugin-runtime-error-modal": "^0.0.3",
```

#### 2-2. vite.config.ts 수정 (❗필수)
`vite.config.ts` 파일에서 Replit 관련 코드를 **반드시** 제거해야 합니다:

1. **4번째 줄 삭제:**
   ```typescript
   import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
   ```

2. **9번째 줄 삭제:**
   ```typescript
   runtimeErrorOverlay(),
   ```

3. **10-17번째 줄 삭제 (전체 블록):**
   ```typescript
   ...(process.env.NODE_ENV !== "production" &&
   process.env.REPL_ID !== undefined
     ? [
         await import("@replit/vite-plugin-cartographer").then((m) =>
           m.cartographer(),
         ),
       ]
     : []),
   ```

**수정 후 plugins 섹션은 다음과 같아야 합니다:**
```typescript
plugins: [
  react(),
],
```

### 단계 3: 의존성 재설치

Replit 패키지 제거 후 깨끗하게 재설치:

```bash
# node_modules 삭제
rm -rf node_modules package-lock.json

# 정상 설치
npm install
```

## 🔧 문제 해결

### npm install 실패
- `--ignore-optional` 플래그 사용
- Node.js 버전 18+ 확인
- 캐시 클리어: `npm cache clean --force`

### 데이터베이스 연결 오류
- DATABASE_URL이 올바르게 설정되었는지 확인
- Supabase 프로젝트가 활성 상태인지 확인
- 비밀번호에 특수문자가 있다면 URL 인코딩 필요

### 빌드 오류
- Node.js 버전 확인 (18+ 권장)
- `npm install` 실행 후 다시 빌드
- 환경변수가 올바르게 설정되었는지 확인

## 📞 추가 지원

배포 과정에서 문제가 발생하면 각 플랫폼의 공식 문서를 참조하세요:
- [Vercel 문서](https://vercel.com/docs)
- [Netlify 문서](https://docs.netlify.com)
- [Railway 문서](https://docs.railway.app)