import { describe, expect, it, test, vi } from 'vitest';

import { Material } from '../src/Material.js';
import { SpriteMaterial } from '../src/SpriteMaterial.js';

describe('Materials', () => {
  describe('SpriteMaterial', () => {
    test('constructor', () => {
      const object = new SpriteMaterial();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new SpriteMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('type', () => {
      const object = new SpriteMaterial();
      expect(object.type).toBe('SpriteMaterial');
    });

    test.todo('color', () => {
      // implement
    });

    test.todo('map', () => {
      // implement
    });

    test.todo('alphaMap', () => {
      // implement
    });

    test.todo('rotation', () => {
      // implement
    });

    test.todo('sizeAttenuation', () => {
      // implement
    });

    test.todo('transparent', () => {
      // implement
    });

    test.todo('fog', () => {
      // implement
    });

    test('isSpriteMaterial', () => {
      const object = new SpriteMaterial();
      expect(object.isSpriteMaterial).toBeTruthy();
    });

    test.todo('copy', () => {
      // implement
    });
  });
});
