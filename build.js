const { execSync } = require('child_process');
const glob = require('glob');

const files = glob.sync('src/**/*.ts');
const esbuildCommand = `esbuild ${files.join(
  ' '
)} --bundle --platform=node --target=node20 --outdir=dist --format=cjs --sourcemap --minify-whitespace --minify-syntax`;

execSync(esbuildCommand, { stdio: 'inherit' });
