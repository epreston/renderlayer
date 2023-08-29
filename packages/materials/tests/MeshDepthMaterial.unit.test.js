import { describe, expect, it, test, vi } from 'vitest';

import { BasicDepthPacking, RGBADepthPacking } from '@renderlayer/shared';
import { Texture } from '@renderlayer/textures';

import { Material } from '../src/Material.js';
import { MeshDepthMaterial } from '../src/MeshDepthMaterial.js';

describe('Materials', () => {
  describe('MeshDepthMaterial', () => {
    test('constructor', () => {
      const object = new MeshDepthMaterial();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new MeshDepthMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('isMeshDepthMaterial', () => {
      const object = new MeshDepthMaterial();
      expect(object.isMeshDepthMaterial).toBeTruthy();
    });

    test('type', () => {
      const object = new MeshDepthMaterial();
      expect(object.type).toBe('MeshDepthMaterial');
    });

    test('depthPacking', () => {
      const object = new MeshDepthMaterial();
      expect(object.depthPacking).toBe(BasicDepthPacking);
    });

    test('map', () => {
      const object = new MeshDepthMaterial();
      expect(object.map).toBeNull();
    });

    test('alphaMap', () => {
      const object = new MeshDepthMaterial();
      expect(object.map).toBeNull();
    });

    test('displacementMap', () => {
      const object = new MeshDepthMaterial();
      expect(object.map).toBeNull();
    });

    test('displacementScale', () => {
      const object = new MeshDepthMaterial();
      expect(object.displacementScale).toBe(1);
    });

    test('displacementBias', () => {
      const object = new MeshDepthMaterial();
      expect(object.displacementBias).toBe(0);
    });

    test('wireframe', () => {
      const object = new MeshDepthMaterial();
      expect(object.wireframe).toBe(false);
    });

    test('wireframeLinewidth', () => {
      const object = new MeshDepthMaterial();
      expect(object.wireframeLinewidth).toBe(1);
    });

    test('copy', () => {
      const object = new MeshDepthMaterial();
      const object2 = new MeshDepthMaterial();

      object2.depthPacking = RGBADepthPacking;

      object2.map = new Texture();
      object2.alphaMap = new Texture();

      object2.displacementMap = new Texture();
      object2.displacementScale = 0.8;
      object2.displacementBias = 0.2;

      object2.wireframe = false;
      object2.wireframeLinewidth = 2;

      object.copy(object2);

      // uuid will be different
      object.uuid = object2.uuid;

      expect(object).not.toBe(object2);
      expect(object).toStrictEqual(object2);
    });
  });
});
