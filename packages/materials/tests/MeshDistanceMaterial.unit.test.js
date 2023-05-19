import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Material } from '../src/Material.js';
import { MeshDistanceMaterial } from '../src/MeshDistanceMaterial.js';

describe('Materials', () => {
  describe('MeshDistanceMaterial', () => {
    test('Instancing', () => {
      const object = new MeshDistanceMaterial();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new MeshDistanceMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('type', () => {
      const object = new MeshDistanceMaterial();
      expect(object.type === 'MeshDistanceMaterial').toBeTruthy();
    });

    test.todo('map', () => {
      // implement
    });

    test.todo('alphaMap', () => {
      // implement
    });

    test.todo('displacementMap', () => {
      // implement
    });

    test.todo('displacementScale', () => {
      // implement
    });

    test.todo('displacementBias', () => {
      // implement
    });

    test('isMeshDistanceMaterial', () => {
      const object = new MeshDistanceMaterial();
      expect(object.isMeshDistanceMaterial).toBeTruthy();
    });

    test.todo('copy', () => {
      // implement
    });
  });
});
