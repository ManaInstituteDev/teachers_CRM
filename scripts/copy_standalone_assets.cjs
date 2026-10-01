const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const standaloneDir = path.join(rootDir, '.next', 'standalone');

if (fs.existsSync(standaloneDir)) {
  try {
    // 1. Copy public -> .next/standalone/public
    const publicSrc = path.join(rootDir, 'public');
    const publicDest = path.join(standaloneDir, 'public');
    if (fs.existsSync(publicSrc)) {
      fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
      console.log('✓ Copied public to .next/standalone/public');
    }

    // 2. Copy .next/static -> .next/standalone/.next/static
    const staticSrc = path.join(rootDir, '.next', 'static');
    const staticDest = path.join(standaloneDir, '.next', 'static');
    if (fs.existsSync(staticSrc)) {
      fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
      console.log('✓ Copied .next/static to .next/standalone/.next/static');
    }

    console.log('✨ Standalone assets copied successfully!');
  } catch (err) {
    console.error('Failed to copy standalone assets:', err);
    process.exit(1);
  }
} else {
  console.log('Standalone folder not found, skipping asset copy.');
}
