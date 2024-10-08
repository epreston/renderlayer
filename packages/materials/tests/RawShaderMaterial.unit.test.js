import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { ShaderMaterial } from '../src/ShaderMaterial.js';
import { RawShaderMaterial } from '../src/RawShaderMaterial.js';

describe('Materials', () => {
  describe('RawShaderMaterial', () => {
    test('constructor', () => {
      const object = new RawShaderMaterial();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new RawShaderMaterial();
      expect(object).toBeInstanceOf(ShaderMaterial);
    });

    test('type', () => {
      const object = new RawShaderMaterial();
      expect(object.type).toBe('RawShaderMaterial');
    });

    test('isRawShaderMaterial', () => {
      const object = new RawShaderMaterial();
      expect(object.isRawShaderMaterial).toBeTruthy();
    });
  });
});
