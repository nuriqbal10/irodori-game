const { execSync } = require('child_process');

if (process.env.NEXT_PRIVATE_STANDALONE === 'true') {
  console.log('[BUILD RUNNER] Inner build: executing next build...');
  execSync('npx next build', { stdio: 'inherit', env: process.env });
} else {
  console.log('[BUILD RUNNER] Outer build: executing opennextjs-cloudflare build...');
  execSync('npx opennextjs-cloudflare build', { stdio: 'inherit', env: process.env });
}
