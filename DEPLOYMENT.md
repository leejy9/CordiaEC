# CordiaEC Deployment Guide

## 배포 전 준비

### 1. Supabase 관리자 계정 생성

Supabase 대시보시드 **Authentication > Users**에서 새 관리자 계정을 생성하세요:
- Email: 원하는 이메일 주소
- Password: 강력한 비밀번호

### 2. 환경변수 설정

`.env.local` 파일이 이미 있으면 그대로 두고, 없으면 생성:

```env
VITE_SUPABASE_URL=https://[your-project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Vercel 배포

### 1. GitHub에 푸시

```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### 2. Vercel에서 프로젝트 연결

1. [vercel.com](https://vercel.com)에서 로그인
2. **Add New** → **Project**
3. GitHub 저장소 선택
4. 환경변수 설정:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. **Deploy** 클릭

### 3. 배포 완료

Vercel은 자동으로:
- `vite build` 실행 (정적 사이트 빌드)
- `dist/public` 배포
- 커스텀 도메인 설정 가능

## 로컬 개발

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

## 타입 체크 & 빌드

```bash
npm run check  # TypeScript 검사
npm run build  # 프로덕션 빌드
```

## 문제 해결

- **500 에러**: Supabase 환경변수 확인
- **RLS 에러**: Supabase 대시보드에서 RLS 정책 확인
- **이미지 업로드 실패**: Supabase Storage `post-images` 버킷 권한 확인
