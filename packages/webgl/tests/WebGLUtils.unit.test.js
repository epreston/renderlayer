import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { WebGLUtils } from '../src/WebGLUtils.js';

describe('WebGL', () => {
  describe('WebGLUtils', () => {
    it('should expose a function', () => {
      expect(WebGLUtils).toBeDefined();
    });

    test.todo('Instancing', () => {
      // implement
    });

    test.todo('convert', () => {
      // implement
    });
  });
});
