import { describe, expect, it, test, vi } from 'vitest';

// import { BackSide } from '@renderlayer/shared';
// import { getUnlitUniformColorSpace } from '@renderlayer/shaders';

import { WebGLMaterials } from '../src/WebGLMaterials.js';

// vi.mock('@renderlayer/shared');
// vi.mock('@renderlayer/shaders');

describe('WebGL', () => {
  describe('WebGLMaterials', () => {
    it('should expose a function', () => {
      expect(WebGLMaterials).toBeDefined();
    });

    test.todo('constructor', () => {
      // implement
    });

    test.todo('refreshFogUniforms', () => {
      // implement
    });

    test.todo('refreshMaterialUniforms', () => {
      // implement
    });
  });
});
