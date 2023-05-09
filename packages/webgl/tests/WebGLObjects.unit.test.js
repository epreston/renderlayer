import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { WebGLObjects } from '../src/WebGLObjects.js';

describe('WebGL', () => {
  describe('WebGLObjects', () => {
    it('should expose a function', () => {
      expect(WebGLObjects).toBeDefined();
    });

    test.todo('Instancing', () => {
      // implement
    });

    test.todo('update', () => {
      // implement
    });

    test.todo('dispose', () => {
      // implement
    });
  });
});
