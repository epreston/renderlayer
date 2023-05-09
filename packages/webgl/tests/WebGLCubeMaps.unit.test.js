import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

// import {
//   CubeReflectionMapping,
//   CubeRefractionMapping,
//   EquirectangularReflectionMapping,
//   EquirectangularRefractionMapping,
// } from '@renderlayer/shared';
// import { WebGLCubeRenderTarget } from '@renderlayer/targets';

import { WebGLCubeMaps } from '../src/WebGLCubeMaps.js';

// vi.mock('@renderlayer/shared');
// vi.mock('@renderlayer/targets');

describe('WebGL', () => {
  describe('WebGLCubeMaps', () => {
    it('should expose a function', () => {
      expect(WebGLCubeMaps).toBeDefined();
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
