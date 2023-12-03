import { describe, expect, it, test, vi } from 'vitest';

// import {
//   CubeReflectionMapping,
//   CubeRefractionMapping,
//   EquirectangularReflectionMapping,
//   EquirectangularRefractionMapping
// } from '@renderlayer/shared';
// import { PMREMGenerator } from '@renderlayer/pmrem';

import { WebGLCubeUVMaps } from '../src/WebGLCubeUVMaps';

// vi.mock('@renderlayer/shared');
// vi.mock('@renderlayer/pmrem');

describe('WebGL', () => {
  describe('WebGLCubeUVMaps', () => {
    it('should expose a class', () => {
      expect(WebGLCubeUVMaps).toBeDefined();
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
