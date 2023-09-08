import { describe, expect, it, test, vi } from 'vitest';

// import { WebGLLights } from '../src/WebGLLights.js';

import { WebGLRenderStates, WebGLRenderState } from '../src/WebGLRenderStates.js';

// vi.mock('./WebGLLights.js');

describe('WebGL', () => {
  describe('WebGLRenderState', () => {
    it('should expose a function', () => {
      expect(WebGLRenderState).toBeDefined();
    });

    test.todo('Instancing', () => {
      // implement
    });

    test.todo('init', () => {
      // implement
    });

    test.todo('state', () => {
      // implement
    });

    test.todo('setupLights', () => {
      // implement
    });

    test.todo('setupLightsView', () => {
      // implement
    });

    test.todo('pushLight', () => {
      // implement
    });

    test.todo('pushShadow', () => {
      // implement
    });
  });

  describe('WebGLRenderStates', () => {
    it('should expose a function', () => {
      expect(WebGLRenderStates).toBeDefined();
    });

    test.todo('Instancing', () => {
      // implement
    });

    test.todo('get', () => {
      // implement
    });

    test.todo('dispose', () => {
      // implement
    });
  });
});
