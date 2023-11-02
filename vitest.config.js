// vitest.config.js

// import types for vitest config autocomplete
/// <reference types="vitest" />

import { configDefaults, defineConfig } from 'vitest/config';
import { entries } from './scripts/aliases.js';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __DEV__: true,
    __TEST__: true,
    __VERSION__: '"test"',
    __BROWSER__: false,
    __GLOBAL__: false,
    __ESM_BUNDLER__: true,
    __ESM_BROWSER__: false,
    __NODE_JS__: true
  },
  resolve: {
    alias: entries
  },
  test: {
    // globals: true,
    // disable threads on GH actions to speed it up
    threads: !process.env.GITHUB_ACTIONS,
    setupFiles: ['./scripts/vitest-setup.js'],
    sequence: {
      hooks: 'list'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html'],
      exclude: [
        ...configDefaults.coverage.exclude,
        // mostly entries that skew coverage reports
        'scripts/mocks',
        'packages/shaders/src/ShaderChunk/**',
        'packages/shaders/src/ShaderLib/**'
      ]
    }
  }
});
