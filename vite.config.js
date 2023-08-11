// vite.config.js

// import types for vitest config autocomplete
/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [visualizer()],
  build: {
    target: ['es2022', 'chrome112', 'edge112', 'firefox112', 'safari16.4', 'ios16.4'],

    // outDir: './dist',
    // emptyOutDir: true,
    // sourcemap: true,

    // Disable minification during dev for faster HMR and code inspection
    minify: false,
    assetsInlineLimit: 0,
    modulePreload: { polyfill: false }
  }
});
