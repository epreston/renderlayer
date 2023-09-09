import { describe, expect, it, test, vi } from 'vitest';

import { WebGLProgram } from '../src/WebGLProgram.js';

describe('WebGL', () => {
  describe('WebGLProgram', () => {
    it('should expose a function', () => {
      expect(WebGLProgram).toBeDefined();
    });

    test.todo('constructor', () => {
      // implement
    });

    test.todo('name', () => {
      // implement
    });

    test.todo('id', () => {
      const object = new WebGLProgram();
      expect(object.id).toBeDefined();

      // can change based on order of tests
      const prevId = object.id;

      const object2 = new WebGLProgram();
      expect(object2.id).toBeGreaterThan(prevId);
    });

    test.todo('cacheKey', () => {
      // implement
    });

    test.todo('usedTimes', () => {
      // implement
    });

    test.todo('program', () => {
      // implement
    });

    test.todo('vertexShader', () => {
      // implement
    });

    test.todo('fragmentShader', () => {
      // implement
    });

    test.todo('getUniforms', () => {
      // implement
    });

    test.todo('getAttributes', () => {
      // implement
    });

    test.todo('destroy', () => {
      // implement
    });
  });
});
