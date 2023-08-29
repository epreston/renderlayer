import { describe, expect, it, test, vi } from 'vitest';

import { Texture } from '@renderlayer/textures';

import { Material } from '../src/Material.js';
import { MeshDistanceMaterial } from '../src/MeshDistanceMaterial.js';

describe('Materials', () => {
  describe('MeshDistanceMaterial', () => {
    test('constructor', () => {
      const object = new MeshDistanceMaterial();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new MeshDistanceMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('isMeshDistanceMaterial', () => {
      const object = new MeshDistanceMaterial();
      expect(object.isMeshDistanceMaterial).toBeTruthy();
    });

    test('type', () => {
      const object = new MeshDistanceMaterial();
      expect(object.type === 'MeshDistanceMaterial').toBeTruthy();
    });

    test('map', () => {
      const object = new MeshDistanceMaterial();
      expect(object.map).toBeNull();
    });

    test('alphaMap', () => {
      const object = new MeshDistanceMaterial();
      expect(object.alphaMap).toBeNull();
    });

    test('displacementMap', () => {
      const object = new MeshDistanceMaterial();
      expect(object.displacementMap).toBeNull();
    });

    test('displacementScale', () => {
      const object = new MeshDistanceMaterial();
      expect(object.displacementScale).toBe(1);
    });

    test('displacementBias', () => {
      const object = new MeshDistanceMaterial();
      expect(object.displacementBias).toBe(0);
    });

    test('copy', () => {
      const object = new MeshDistanceMaterial();
      const object2 = new MeshDistanceMaterial();

      object2.map = new Texture();
      object2.alphaMap = new Texture();

      object2.displacementMap = new Texture();
      object2.displacementScale = 0.8;
      object2.displacementBias = 0.2;

      object.copy(object2);

      // uuid will be different
      object.uuid = object2.uuid;

      expect(object).not.toBe(object2);
      expect(object).toStrictEqual(object2);
    });
  });
});
