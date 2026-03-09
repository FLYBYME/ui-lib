import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function build() {
  const commonConfig = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ['es2020', 'chrome80', 'firefox75', 'safari12'],
  };

  try {
    // ESM Build
    console.log('Building ESM...');
    await esbuild.build({
      ...commonConfig,
      format: 'esm',
      outfile: 'dist/ui-lib.esm.js',
    });

    // IIFE Build (for browser <script> tags)
    console.log('Building IIFE...');
    await esbuild.build({
      ...commonConfig,
      format: 'iife',
      globalName: 'UILib',
      outfile: 'dist/ui-lib.js',
    });

    console.log('Build complete! Artifacts are in the dist/ folder.');
  } catch (e) {
    console.error('Build failed:', e);
    process.exit(1);
  }
}

build();
