// vite.config.js

// import types for vitest config autocomplete
/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  // assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.m4a'], // additional asset types
  define: {
    // ensure inline tests are removed in production builds
    'import.meta.vitest': 'undefined',
  },
  plugins: [visualizer()],
  build: {
    target: ['es2022', 'edge111', 'firefox111', 'chrome111', 'safari16.3', 'ios16.3'],

    // outDir: './dist',
    // emptyOutDir: true,
    // sourcemap: true,

    // Disable minification during dev for faster HMR and code inspection
    minify: false,
    assetsInlineLimit: 0,
    modulePreload: { polyfill: false },
  },
  // server: {
  //   hmr: true,
  //   open: '/index.html',
  // },
});
