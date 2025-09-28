# CordiaEC 외부 배포 가이드

이 문서는 CordiaEC 웹사이트를 GitHub에서 Vercel, Netlify 등 외부 플랫폼에 배포하는 방법을 설명합니다.

## 🚀 외부 배포 단계별 가이드

### 단계 1: GitHub Clone 후 즉시 자동 정리 (필수)

GitHub에서 clone한 **즉시** 다음 자동화 스크립트를 실행하세요:

```bash
# ⚠️ npm install 하기 전에 먼저 실행!
node prepare-for-deployment.js
```

이 스크립트가 다음 작업을 자동으로 수행합니다:
- ✅ 파일 백업 생성 (package.json.backup, vite.config.ts.backup)
- ✅ Replit 패키지 제거 (package.json에서)
- ✅ vite.config.ts에서 Replit import 제거
- ✅ node_modules 정리 및 깨끗한 재설치
- ✅ 빌드 테스트

**완료되면 "✅ 외부 배포 준비 완료!" 메시지가 표시됩니다.**

### 단계 2: Supabase 데이터베이스 설정

#### 2-1. Supabase 프로젝트 생성

1. **[Supabase 대시보드](https://supabase.com/dashboard/projects)에 접속**
2. **"New Project"** 버튼 클릭
3. 프로젝트 정보 입력:
   - **Name**: `CordiaEC` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 입력 (중요: 기억해두세요!)
   - **Region**: 가장 가까운 지역 선택
4. **"Create new project"** 클릭
5. 프로젝트 생성 완료까지 대기 (1-2분 소요)

#### 2-2. DATABASE_URL 가져오기

1. 프로젝트 대시보드에서 **"Connect"** 버튼 클릭
2. **"Connection string"** 탭 선택
3. **"Transaction pooler"** 옵션 선택 (중요!)
4. 표시된 URI를 복사:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
5. `[YOUR-PASSWORD]` 부분을 실제 비밀번호로 교체

### 단계 3: 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력:

```env
# 필수: Supabase 데이터베이스 URL (위에서 복사한 URL 붙여넣기)
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@aws-0-[REGION].pooler.supabase.com:6543/postgres

# 애플리케이션 설정
NODE_ENV=production
PORT=5000
```

**예시**:
```env
DATABASE_URL=postgresql://postgres:mySecurePassword123@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### 단계 4: 데이터베이스 스키마 생성

로컬에서 Supabase 테이블을 생성하세요:

```bash
npm run db:push
```

## 📦 배포 플랫폼별 설정

**중요**: 위의 **단계 1-4**를 모두 완료한 후 아래 배포를 진행하세요.

### Vercel 배포

1. GitHub에 코드 업로드
2. [Vercel](https://vercel.com)에서 GitHub 저장소 연결
3. 환경변수 설정:
   - `DATABASE_URL`: Supabase 연결 문자열
   - `NODE_ENV`: `production`
4. 빌드 명령어: `npm run build`
5. 시작 명령어: `npm start`

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

## ✅ 배포 후 확인사항

1. 웹사이트가 정상적으로 로드되는지 확인
2. Contact 폼 제출 테스트
3. Supabase 대시보드에서 데이터 저장 확인

## 🔧 문제 해결

### 자동화 스크립트 실패
```bash
# 백업에서 복원
node restore-from-backup.js

# 다시 시도
node prepare-for-deployment.js
```

### 데이터베이스 연결 오류
- DATABASE_URL이 올바르게 설정되었는지 확인
- Supabase 프로젝트가 활성 상태인지 확인
- 비밀번호에 특수문자가 있다면 URL 인코딩 필요

### 빌드 오류
- Node.js 버전 확인 (18+ 권장)
- 자동화 스크립트가 성공적으로 실행되었는지 확인
- 환경변수가 올바르게 설정되었는지 확인

## 📋 중요 파일들

자동화 스크립트가 생성하는 백업 파일들:
- `package.json.backup` - 원본 package.json
- `vite.config.ts.backup` - 원본 vite.config.ts

⚠️ **이 백업 파일들을 GitHub에 커밋하지 마세요!**

## 📞 추가 지원

배포 과정에서 문제가 발생하면 각 플랫폼의 공식 문서를 참조하세요:
- [Vercel 문서](https://vercel.com/docs)
- [Netlify 문서](https://docs.netlify.com)
- [Railway 문서](https://docs.railway.app)