#!/usr/bin/env node
/**
 * CordiaEC 외부 배포 준비 스크립트 (크로스 플랫폼)
 * 사용법: node prepare-for-deployment.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 CordiaEC 외부 배포 준비 시작...\n');

try {
  // 1. package.json 백업 및 수정
  console.log('📦 package.json 백업 및 Replit 패키지 제거 중...');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // 백업 저장
  fs.writeFileSync(
    path.join(__dirname, 'package.json.backup'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Replit 패키지 제거
  if (packageJson.devDependencies) {
    delete packageJson.devDependencies['@replit/vite-plugin-cartographer'];
    delete packageJson.devDependencies['@replit/vite-plugin-runtime-error-modal'];
    console.log('✅ Replit 패키지 제거 완료');
  }
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // 2. vite.config.ts 백업 및 수정
  console.log('⚙️  vite.config.ts 백업 및 수정 중...');
  
  const viteConfigPath = path.join(__dirname, 'vite.config.ts');
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  // 백업 저장
  fs.writeFileSync(
    path.join(__dirname, 'vite.config.ts.backup'),
    viteConfig
  );
  
  // Replit 관련 코드 제거
  let cleanedConfig = viteConfig
    .replace(/import runtimeErrorOverlay from "@replit\/vite-plugin-runtime-error-modal";\n/, '')
    .replace(/\s*runtimeErrorOverlay\(\),\n/, '')
    .replace(/\s*\.\.\.\(process\.env\.NODE_ENV[^}]*}\),?\n?/s, '');
  
  fs.writeFileSync(viteConfigPath, cleanedConfig);
  console.log('✅ vite.config.ts 수정 완료');

  // 3. node_modules 정리 및 재설치
  console.log('🧹 node_modules 정리 중...');
  
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  const packageLockPath = path.join(__dirname, 'package-lock.json');
  
  if (fs.existsSync(nodeModulesPath)) {
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
  }
  if (fs.existsSync(packageLockPath)) {
    fs.unlinkSync(packageLockPath);
  }
  
  console.log('📦 의존성 재설치 중...');
  execSync('npm install', { stdio: 'inherit' });
  
  // 4. 빌드 테스트
  console.log('🔨 빌드 테스트 중...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\n✅ 외부 배포 준비 완료!');
  console.log('📋 다음 단계:');
  console.log('   1. .env 파일에 Supabase DATABASE_URL 설정');
  console.log('   2. GitHub에 커밋 및 푸시');
  console.log('   3. 배포 플랫폼에서 환경변수 설정');
  console.log('\n🔄 롤백하려면: node restore-from-backup.js');

} catch (error) {
  console.error('\n❌ 오류 발생:', error.message);
  console.log('\n🔄 롤백하려면: node restore-from-backup.js');
  process.exit(1);
}