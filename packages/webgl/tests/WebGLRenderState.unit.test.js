import { describe, expect, it, test, vi } from 'vitest';

// import { WebGLLights } from '../src/WebGLLights.js';

// exposes two objects
import { WebGLRenderState } from '../src/WebGLRenderStates.js';

// vi.mock('./WebGLLights.js');

describe('WebGL', () => {
  describe('WebGLRenderState', () => {
    it('should expose a function', () => {
      expect(WebGLRenderState).toBeDefined();
    });

    test.todo('constructor', () => {
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
});
