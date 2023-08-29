import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Material } from '../src/Material.js';
import { MeshNormalMaterial } from '../src/MeshNormalMaterial.js';

describe('Materials', () => {
  describe('MeshNormalMaterial', () => {
    test('constructor', () => {
      const object = new MeshNormalMaterial();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new MeshNormalMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('type', () => {
      const object = new MeshNormalMaterial();
      expect(object.type).toBe('MeshNormalMaterial');
    });

    test.todo('bumpMap', () => {
      // implement
    });

    test.todo('bumpScale', () => {
      // implement
    });

    test.todo('normalMap', () => {
      // implement
    });

    test.todo('normalMapType', () => {
      // implement
    });

    test.todo('normalScale', () => {
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

    test.todo('flatShading', () => {
      // implement
    });

    test('isMeshNormalMaterial', () => {
      const object = new MeshNormalMaterial();
      expect(object.isMeshNormalMaterial).toBeTruthy();
    });

    test.todo('copy', () => {
      // implement
    });
  });
});
