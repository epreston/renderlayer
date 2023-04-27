// vitest.config.js

/// <reference types="vitest" />

import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import viteConfig from './vite.config.js';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // setupFiles: ['./test/setup/setup.js'],
      // includeSource: ['src/**/*.{js,ts}'], // enable inline tests
      coverage: {
        provider: 'c8',
        reporter: ['html'],
        // reporter: ['text', 'html'], // default
        // reporter: ['text'],
      },
    },
  })
);
