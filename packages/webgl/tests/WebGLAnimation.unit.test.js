import { describe, expect, it, test, vi } from 'vitest';

import { WebGLAnimation } from '../src/WebGLAnimation.js';

describe('WebGL', () => {
  describe('WebGLAnimation', () => {
    it('should expose a function', () => {
      expect(WebGLAnimation).toBeDefined();
    });

    test('constructor', () => {
      const object = new WebGLAnimation();
      expect(object).toBeDefined();
    });

    test.todo('start', () => {
      // implement
    });

    test.todo('stop', () => {
      // implement
    });

    test.todo('setAnimationLoop', () => {
      // implement
    });

    test.todo('setContext', () => {
      // implement
    });
  });
});
