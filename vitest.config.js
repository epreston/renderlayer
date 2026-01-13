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
    __CJS__: true
  },
  resolve: {
    alias: entries
  },
  test: {
    // Debugging Tests
    // testTimeout: 0,
    // fileParallelism: false,

    // globals: true,
    pool: 'forks',
    setupFiles: ['./scripts/setup-vitest.js'],
    sequence: {
      hooks: 'list'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html'],
      exclude: [
        ...configDefaults.coverage.exclude,
        // entries that skew coverage reports below
        'scripts/**',
        'packages/shaders/src/ShaderChunk/**',
        'packages/shaders/src/ShaderLib/**'
      ]
    }
  }
});
