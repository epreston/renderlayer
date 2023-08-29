import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Material } from '../src/Material.js';
import { LineBasicMaterial } from '../src/LineBasicMaterial.js';

describe('Materials', () => {
  describe('LineBasicMaterial', () => {
    test('constructor', () => {
      const object = new LineBasicMaterial();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new LineBasicMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('type', () => {
      const object = new LineBasicMaterial();
      expect(object.type).toBe('LineBasicMaterial');
    });

    test.todo('color', () => {
      // implement
    });

    test.todo('linewidth', () => {
      // implement
    });

    test.todo('linecap', () => {
      // implement
    });

    test.todo('linejoin', () => {
      // implement
    });

    test.todo('fog', () => {
      // implement
    });

    test('isLineBasicMaterial', () => {
      const object = new LineBasicMaterial();
      expect(object.isLineBasicMaterial).toBeTruthy();
    });

    test.todo('copy', () => {
      // implement
    });
  });
});
