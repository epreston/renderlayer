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
    target: ['es2022', 'chrome112', 'edge112', 'firefox112', 'safari16.4', 'ios16.4'],

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
