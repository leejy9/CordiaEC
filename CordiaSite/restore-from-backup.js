#!/usr/bin/env node
/**
 * CordiaEC 백업 복원 스크립트
 * 사용법: node restore-from-backup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 백업에서 복원 중...\n');

try {
  // package.json 복원
  const packageBackupPath = path.join(__dirname, 'package.json.backup');
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  if (fs.existsSync(packageBackupPath)) {
    fs.copyFileSync(packageBackupPath, packageJsonPath);
    fs.unlinkSync(packageBackupPath);
    console.log('✅ package.json 복원 완료');
  }

  // vite.config.ts 복원
  const viteBackupPath = path.join(__dirname, 'vite.config.ts.backup');
  const viteConfigPath = path.join(__dirname, 'vite.config.ts');
  
  if (fs.existsSync(viteBackupPath)) {
    fs.copyFileSync(viteBackupPath, viteConfigPath);
    fs.unlinkSync(viteBackupPath);
    console.log('✅ vite.config.ts 복원 완료');
  }

  console.log('\n✅ 백업 복원 완료!');
  console.log('💡 원본 상태로 돌아갔습니다.');

} catch (error) {
  console.error('\n❌ 복원 오류:', error.message);
  process.exit(1);
}