import { beforeAll, beforeEach, createExpect, describe, expect, it, test, vi } from 'vitest';

import { Material } from '../src/Material.js';
import { MeshDepthMaterial } from '../src/MeshDepthMaterial.js';

describe('Materials', () => {
  describe('MeshDepthMaterial', () => {
    test('Instancing', () => {
      const object = new MeshDepthMaterial();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new MeshDepthMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('type', () => {
      const object = new MeshDepthMaterial();
      expect(object.type === 'MeshDepthMaterial').toBeTruthy();
    });

    test.todo('depthPacking', () => {
      // implement
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

    test.todo('wireframe', () => {
      // implement
    });

    test.todo('wireframeLinewidth', () => {
      // implement
    });

    test('isMeshDepthMaterial', () => {
      const object = new MeshDepthMaterial();
      expect(object.isMeshDepthMaterial).toBeTruthy();
    });

    test.todo('copy', () => {
      // implement
    });
  });
});
