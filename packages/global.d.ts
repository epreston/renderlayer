/// <reference types="vite/client" />

declare module '*.glsl' {
  const src: string;
  export default src;
}

// Global compile-time constants
declare var __DEV__: boolean;
declare var __TEST__: boolean;
declare var __VERSION__: string;
declare var __BROWSER__: boolean;
declare var __GLOBAL__: boolean;
declare var __ESM_BUNDLER__: boolean;
declare var __ESM_BROWSER__: boolean;
declare var __CJS__: boolean;
declare var __COMMIT__: string;

import type { Assertion, AsymmetricMatchersContaining } from 'vitest';

// custom matchers for tests
interface CustomMatchers<R = unknown> {
  toHaveBeenWarned(): R;
  toHaveBeenWarnedLast(): R;
  toHaveBeenWarnedTimes(n: number): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// deprecations

declare interface String {
  /**
   * @deprecated Please use String.prototype.slice instead of String.prototype.substring in the repository.
   */
  substring(start: number, end?: number): string;
}
