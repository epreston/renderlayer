import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { ShaderMaterial } from '../src/ShaderMaterial.js';
import { RawShaderMaterial } from '../src/RawShaderMaterial.js';

describe('Materials', () => {
  describe('RawShaderMaterial', () => {
    test('Instancing', () => {
      const object = new RawShaderMaterial();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new RawShaderMaterial();
      expect(object).toBeInstanceOf(ShaderMaterial);
    });

    test('type', () => {
      const object = new RawShaderMaterial();
      expect(object.type === 'RawShaderMaterial').toBeTruthy();
    });

    test('isRawShaderMaterial', () => {
      const object = new RawShaderMaterial();
      expect(object.isRawShaderMaterial).toBeTruthy();
    });
  });
});
