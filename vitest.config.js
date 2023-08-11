// vitest.config.js

/// <reference types="vitest" />

import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import viteConfig from './vite.config.js';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // globals: true,
      // disable threads on GH actions to speed it up
      threads: !process.env.GITHUB_ACTIONS,
      setupFiles: ['./scripts/vitest-setup.js'],
      // includeSource: ['src/**/*.{js,ts}'], // enable inline tests
      coverage: {
        provider: 'v8',
        reporter: ['text-summary', 'html']
      }
    }
  })
);
