import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Material } from '../src/Material.js';
import { PointsMaterial } from '../src/PointsMaterial.js';

describe('Materials', () => {
  describe('PointsMaterial', () => {
    test('constructor', () => {
      const object = new PointsMaterial();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new PointsMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('type', () => {
      const object = new PointsMaterial();
      expect(object.type).toBe('PointsMaterial');
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

    test.todo('size', () => {
      // implement
    });

    test.todo('sizeAttenuation', () => {
      // implement
    });

    test.todo('fog', () => {
      // implement
    });

    test('isPointsMaterial', () => {
      const object = new PointsMaterial();
      expect(object.isPointsMaterial).toBeTruthy();
    });

    test.todo('copy', () => {
      // implement
    });
  });
});
