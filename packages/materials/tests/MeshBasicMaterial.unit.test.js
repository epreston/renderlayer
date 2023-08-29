import { describe, expect, it, test, vi } from 'vitest';

import { Color } from '@renderlayer/math';
import { MixOperation, MultiplyOperation } from '@renderlayer/shared';
import { Texture } from '@renderlayer/textures';

import { Material } from '../src/Material.js';
import { MeshBasicMaterial } from '../src/MeshBasicMaterial.js';

describe('Materials', () => {
  describe('MeshBasicMaterial', () => {
    test('constructor', () => {
      const object = new MeshBasicMaterial();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new MeshBasicMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('isMeshBasicMaterial', () => {
      const object = new MeshBasicMaterial();
      expect(object.isMeshBasicMaterial).toBeTruthy();
    });

    test('type', () => {
      const object = new MeshBasicMaterial();
      expect(object.type).toBe('MeshBasicMaterial');
    });

    test('color', () => {
      const object = new MeshBasicMaterial();
      expect(object.color.equals(new Color(0xffffff))).toBeTruthy();
    });

    test('map', () => {
      const object = new MeshBasicMaterial();
      expect(object.map).toBeNull();
    });

    test('lightMap', () => {
      const object = new MeshBasicMaterial();
      expect(object.lightMap).toBeNull();
    });

    test('lightMapIntensity', () => {
      const object = new MeshBasicMaterial();
      expect(object.lightMapIntensity).toBe(1);
    });

    test('aoMap', () => {
      const object = new MeshBasicMaterial();
      expect(object.aoMap).toBeNull();
    });

    test('aoMapIntensity', () => {
      const object = new MeshBasicMaterial();
      expect(object.aoMapIntensity).toBe(1);
    });

    test('specularMap', () => {
      const object = new MeshBasicMaterial();
      expect(object.specularMap).toBeNull();
    });

    test('alphaMap', () => {
      const object = new MeshBasicMaterial();
      expect(object.alphaMap).toBeNull();
    });

    test('envMap', () => {
      const object = new MeshBasicMaterial();
      expect(object.envMap).toBeNull();
    });

    test('combine', () => {
      const object = new MeshBasicMaterial();
      expect(object.combine).toBe(MultiplyOperation);
    });

    test('reflectivity', () => {
      const object = new MeshBasicMaterial();
      expect(object.reflectivity).toBe(1);
    });

    test('refractionRatio', () => {
      const object = new MeshBasicMaterial();
      expect(object.refractionRatio).toBeCloseTo(0.98);
    });

    test('wireframe', () => {
      const object = new MeshBasicMaterial();
      expect(object.wireframe).toBe(false);
    });

    test('wireframeLinewidth', () => {
      const object = new MeshBasicMaterial();
      expect(object.wireframeLinewidth).toBe(1);
    });

    test('wireframeLinecap', () => {
      const object = new MeshBasicMaterial();
      expect(object.wireframeLinecap).toBe('round');
    });

    test('wireframeLinejoin', () => {
      const object = new MeshBasicMaterial();
      expect(object.wireframeLinejoin).toBe('round');
    });

    test('fog', () => {
      const object = new MeshBasicMaterial();
      expect(object.fog).toBe(true);
    });

    test('copy', () => {
      const object = new MeshBasicMaterial();
      const object2 = new MeshBasicMaterial();

      object2.color = new Color(0x3d3d3d);
      object2.map = new Texture();

      object2.lightMap = new Texture();
      object2.lightMapIntensity = 0.5;

      object2.alphaMap = new Texture();
      object2.aoMapIntensity = 0.5;

      object2.specularMap = new Texture();
      object2.alphaMap = new Texture();

      object2.envMap = new Texture();
      object2.combine = MixOperation;

      object2.reflectivity = 0.5;
      object2.refractionRatio = 0.88;

      object2.wireframe = true;
      object2.wireframeLinewidth = 2;
      object2.wireframeLinecap = 'square';
      object2.wireframeLinejoin = 'square';

      object2.fog = false;

      object.copy(object2);

      // uuid will be different
      object.uuid = object2.uuid;

      expect(object).not.toBe(object2);
      expect(object).toStrictEqual(object2);
    });
  });
});
