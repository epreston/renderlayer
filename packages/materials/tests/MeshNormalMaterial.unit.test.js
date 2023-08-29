import { describe, expect, it, test, vi } from 'vitest';

import { Vector2 } from '@renderlayer/math';
import { ObjectSpaceNormalMap, TangentSpaceNormalMap } from '@renderlayer/shared';
import { Texture } from '@renderlayer/textures';

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

    test('isMeshNormalMaterial', () => {
      const object = new MeshNormalMaterial();
      expect(object.isMeshNormalMaterial).toBeTruthy();
    });

    test('type', () => {
      const object = new MeshNormalMaterial();
      expect(object.type).toBe('MeshNormalMaterial');
    });

    test('bumpMap', () => {
      const object = new MeshNormalMaterial();
      expect(object.bumpMap).toBeNull();
    });

    test('bumpScale', () => {
      const object = new MeshNormalMaterial();
      expect(object.bumpScale).toBe(1);
    });

    test('normalMap', () => {
      const object = new MeshNormalMaterial();
      expect(object.normalMap).toBeNull();
    });

    test('normalMapType', () => {
      const object = new MeshNormalMaterial();
      expect(object.normalMapType).toBe(TangentSpaceNormalMap);
    });

    test('normalScale', () => {
      const object = new MeshNormalMaterial();
      expect(object.normalScale.equals(new Vector2(1, 1))).toBeTruthy();
    });

    test('displacementMap', () => {
      const object = new MeshNormalMaterial();
      expect(object.displacementMap).toBeNull();
    });

    test('displacementScale', () => {
      const object = new MeshNormalMaterial();
      expect(object.displacementScale).toBe(1);
    });

    test('displacementBias', () => {
      const object = new MeshNormalMaterial();
      expect(object.displacementBias).toBe(0);
    });

    test('wireframe', () => {
      const object = new MeshNormalMaterial();
      expect(object.wireframe).toBe(false);
    });

    test('wireframeLinewidth', () => {
      const object = new MeshNormalMaterial();
      expect(object.wireframeLinewidth).toBe(1);
    });

    test('flatShading', () => {
      const object = new MeshNormalMaterial();
      expect(object.flatShading).toBe(false);
    });

    test('copy', () => {
      const object = new MeshNormalMaterial();
      const object2 = new MeshNormalMaterial();

      object2.bumpMap = new Texture();
      object2.bumpScale = 0.5;

      object2.normalMap = new Texture();
      object2.normalMapType = ObjectSpaceNormalMap;
      object2.normalScale = new Vector2(0.7, 0.8);

      object2.displacementMap = new Texture();
      object2.displacementScale = 0.8;
      object2.displacementBias = 0.2;

      object2.wireframe = true;
      object2.wireframeLinewidth = 2;

      object2.flatShading = true;

      object.copy(object2);

      // uuid will be different
      object.uuid = object2.uuid;

      expect(object).not.toBe(object2);
      expect(object).toStrictEqual(object2);
    });
  });
});
