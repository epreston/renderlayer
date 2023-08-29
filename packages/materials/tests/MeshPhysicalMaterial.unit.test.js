import { describe, expect, it, test, vi } from 'vitest';

import { Color, Vector2 } from '@renderlayer/math';
import { Texture } from '@renderlayer/textures';

import { Material } from '../src/Material.js';
import { MeshPhysicalMaterial } from '../src/MeshPhysicalMaterial.js';

describe('Materials', () => {
  describe('MeshPhysicalMaterial', () => {
    test('constructor', () => {
      const object = new MeshPhysicalMaterial();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new MeshPhysicalMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('isMeshPhysicalMaterial', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.isMeshPhysicalMaterial).toBeTruthy();
    });

    test('type', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.type).toBe('MeshPhysicalMaterial');
    });

    test('defines', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.defines).toEqual({
        STANDARD: '',
        PHYSICAL: ''
      });
    });

    test('clearcoatMap', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.clearcoatMap).toBeNull();
    });

    test('clearcoatRoughness', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.clearcoatRoughness).toBe(0.0);
    });

    test('clearcoatRoughnessMap', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.clearcoatRoughnessMap).toBeNull();
    });

    test('clearcoatNormalScale', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.clearcoatNormalScale.equals(new Vector2(1, 1))).toBeTruthy();
    });

    test('clearcoatNormalMap', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.clearcoatNormalMap).toBeNull();
    });

    test('ior', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.ior).toBe(1.5);
    });

    test('reflectivity', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.reflectivity).toBe(0.5);
    });

    test('iridescenceMap', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.iridescenceMap).toBeNull();
    });

    test('iridescenceIOR', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.iridescenceIOR).toBe(1.3);
    });

    test('iridescenceThicknessRange', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.iridescenceThicknessRange).toBeInstanceOf(Array);
      expect(object.iridescenceThicknessRange.length).toBe(2);
    });

    test('iridescenceThicknessMap', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.iridescenceThicknessMap).toBeNull();
    });

    test('sheenColor', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.sheenColor.equals(new Color(0x000000))).toBeTruthy();
    });

    test('sheenColorMap', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.sheenColorMap).toBeNull();
    });

    test('sheenRoughness', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.sheenRoughness).toBe(1.0);
    });

    test('sheenRoughnessMap', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.sheenRoughnessMap).toBeNull();
    });

    test('transmissionMap', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.transmissionMap).toBeNull();
    });

    test('thickness', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.thickness).toBe(0);
    });

    test('thicknessMap', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.thicknessMap).toBeNull();
    });

    test('attenuationDistance', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.attenuationDistance).toBe(Infinity);
    });

    test('attenuationColor', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.attenuationColor.equals(new Color(1, 1, 1))).toBeTruthy();
    });

    test('specularIntensity', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.specularIntensity).toBe(1.0);
    });

    test('specularIntensityMap', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.specularIntensityMap).toBeNull();
    });

    test('specularColor', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.specularColor.equals(new Color(1, 1, 1))).toBeTruthy();
    });

    test('specularColorMap', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.specularColorMap).toBeNull();
    });

    test('sheen', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.sheen).toBe(0.0);
    });

    test('clearcoat', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.clearcoat).toBe(0);
    });

    test('iridescence', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.iridescence).toBe(0);
    });

    test('transmission', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.transmission).toBe(0);
    });

    test('copy', () => {
      const object = new MeshPhysicalMaterial();
      const object2 = new MeshPhysicalMaterial();

      object2.clearcoatMap = new Texture();
      object2.clearcoatRoughness = 0.1;
      object2.clearcoatRoughnessMap = new Texture();
      object2.clearcoatNormalScale = new Vector2(0.8, 1);
      object2.clearcoatNormalMap = new Texture();

      object2.ior = 1.1;

      object2.iridescenceMap = new Texture();
      object2.iridescenceIOR = 1.2;
      object2.iridescenceThicknessRange = [100, 400];
      object2.iridescenceThicknessMap = new Texture();

      object2.sheenColor = new Color(0x000000);
      object2.sheenColorMap = new Texture();
      object2.sheenRoughness = 0.5;
      object2.sheenRoughnessMap = new Texture();

      object2.transmissionMap = new Texture();

      object2.thickness = 1;
      object2.thicknessMap = new Texture();
      object2.attenuationDistance = Infinity;
      object2.attenuationColor = new Color(1, 1, 0.5);

      object2.specularIntensity = 0.8;
      object2.specularIntensityMap = new Texture();
      object2.specularColor = new Color(1, 0, 1);
      object2.specularColorMap = new Texture();

      object2.sheen = 0.2;
      object2.clearcoat = 1;
      object2.iridescence = 1;
      object2.transmission = 1;

      object.copy(object2);

      // uuid will be different
      object.uuid = object2.uuid;

      expect(object).not.toBe(object2);
      expect(object).toStrictEqual(object2);
    });
  });
});
