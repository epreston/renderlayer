import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Material } from '../src/Material.js';
import { ShadowMaterial } from '../src/ShadowMaterial.js';

describe('Materials', () => {
  describe('ShadowMaterial', () => {
    test('Instancing', () => {
      const object = new ShadowMaterial();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new ShadowMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('type', () => {
      const object = new ShadowMaterial();
      expect(object.type).toBe('ShadowMaterial');
    });

    test.todo('color', () => {
      // implement
    });

    test.todo('transparent', () => {
      // implement
    });

    test.todo('fog', () => {
      // implement
    });

    test('isShadowMaterial', () => {
      const object = new ShadowMaterial();
      expect(object.isShadowMaterial).toBeTruthy();
    });

    test.todo('copy', () => {
      // implement
    });
  });
});
