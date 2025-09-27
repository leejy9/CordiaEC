#!/bin/bash
# CordiaEC 외부 배포 준비 스크립트
# GitHub에 올리기 전에 실행하세요

echo "🚀 CordiaEC 외부 배포 준비 중..."

# 1. Replit 종속성 제거 (package.json)
echo "📦 package.json에서 Replit 패키지 제거 중..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' '/@replit\/vite-plugin-cartographer/d' package.json
    sed -i '' '/@replit\/vite-plugin-runtime-error-modal/d' package.json
else
    # Linux
    sed -i '/@replit\/vite-plugin-cartographer/d' package.json
    sed -i '/@replit\/vite-plugin-runtime-error-modal/d' package.json
fi

# 2. vite.config.ts 백업 및 수정
echo "⚙️  vite.config.ts 백업 및 수정 중..."
cp vite.config.ts vite.config.ts.backup

# Replit import 제거
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' '/import runtimeErrorOverlay from "@replit\/vite-plugin-runtime-error-modal";/d' vite.config.ts
    sed -i '' '/runtimeErrorOverlay(),/d' vite.config.ts
    sed -i '' '/\.\.\.(process\.env\.NODE_ENV/,/\]/d' vite.config.ts
else
    sed -i '/import runtimeErrorOverlay from "@replit\/vite-plugin-runtime-error-modal";/d' vite.config.ts
    sed -i '/runtimeErrorOverlay(),/d' vite.config.ts
    sed -i '/\.\.\.(process\.env\.NODE_ENV/,/\]/d' vite.config.ts
fi

# 3. node_modules 재설치
echo "📦 의존성 재설치 중..."
rm -rf node_modules package-lock.json
npm install

# 4. 빌드 테스트
echo "🔨 빌드 테스트 중..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 외부 배포 준비 완료!"
    echo "📋 다음 단계:"
    echo "   1. .env 파일에 Supabase DATABASE_URL 설정"
    echo "   2. GitHub에 커밋 및 푸시"
    echo "   3. 배포 플랫폼에서 환경변수 설정"
    echo ""
    echo "🔄 롤백하려면: mv vite.config.ts.backup vite.config.ts"
else
    echo "❌ 빌드 실패! vite.config.ts를 확인하세요."
    echo "🔄 롤백: mv vite.config.ts.backup vite.config.ts"
    exit 1
fi