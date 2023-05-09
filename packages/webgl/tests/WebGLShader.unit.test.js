import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { WebGLShader } from '../src/WebGLShader.js';

describe('WebGL', () => {
  describe('WebGLShader', () => {
    it('should expose a function', () => {
      expect(WebGLShader).toBeDefined();
    });

    test.todo('Instancing', () => {
      // implement
    });
  });
});
