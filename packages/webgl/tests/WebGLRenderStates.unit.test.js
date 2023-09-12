import { describe, expect, it, test, vi } from 'vitest';

// import { WebGLLights } from '../src/WebGLLights.js';

// exposes two objects
import { WebGLRenderStates } from '../src/WebGLRenderStates.js';

// vi.mock('./WebGLLights.js');

describe('WebGL', () => {
  describe('WebGLRenderStates', () => {
    it('should expose a function', () => {
      expect(WebGLRenderStates).toBeDefined();
    });

    test.todo('constructor', () => {
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
