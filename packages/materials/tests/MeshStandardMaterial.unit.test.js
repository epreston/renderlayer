import { describe, expect, it, test, vi } from 'vitest';

import { Color, Vector2 } from '@renderlayer/math';
import { TangentSpaceNormalMap } from '@renderlayer/shared';
import { Texture } from '@renderlayer/textures';

import { Material } from '../src/Material.js';
import { MeshStandardMaterial } from '../src/MeshStandardMaterial.js';

describe('Materials', () => {
  describe('MeshStandardMaterial', () => {
    test('constructor', () => {
      const object = new MeshStandardMaterial();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new MeshStandardMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('isMeshStandardMaterial', () => {
      const object = new MeshStandardMaterial();
      expect(object.isMeshStandardMaterial).toBeTruthy();
    });

    test('type', () => {
      const object = new MeshStandardMaterial();
      expect(object.type).toBe('MeshStandardMaterial');
    });

    test('defines', () => {
      const object = new MeshStandardMaterial();
      expect(object.defines).toEqual({
        STANDARD: ''
      });
    });

    test('color', () => {
      // diffuse color
      const object = new MeshStandardMaterial();
      expect(object.color.equals(new Color(0xffffff))).toBeTruthy();
    });

    test('roughness', () => {
      const object = new MeshStandardMaterial();
      expect(object.roughness).toBe(1.0);
    });

    test('metalness', () => {
      const object = new MeshStandardMaterial();
      expect(object.metalness).toBe(0.0);
    });

    test('map', () => {
      const object = new MeshStandardMaterial();
      expect(object.map).toBeNull();
    });

    test('lightMap', () => {
      const object = new MeshStandardMaterial();
      expect(object.lightMap).toBeNull();
    });

    test('lightMapIntensity', () => {
      const object = new MeshStandardMaterial();
      expect(object.lightMapIntensity).toBe(1.0);
    });

    test('aoMap', () => {
      const object = new MeshStandardMaterial();
      expect(object.aoMap).toBeNull();
    });

    test('aoMapIntensity', () => {
      const object = new MeshStandardMaterial();
      expect(object.aoMapIntensity).toBe(1.0);
    });

    test('emissive', () => {
      // color
      const object = new MeshStandardMaterial();
      expect(object.emissive.equals(new Color(0x000000))).toBeTruthy();
    });

    test('emissiveIntensity', () => {
      const object = new MeshStandardMaterial();
      expect(object.emissiveIntensity).toBe(1.0);
    });

    test('emissiveMap', () => {
      const object = new MeshStandardMaterial();
      expect(object.emissiveMap).toBeNull();
    });

    test('bumpMap', () => {
      const object = new MeshStandardMaterial();
      expect(object.bumpMap).toBeNull();
    });

    test('bumpScale', () => {
      const object = new MeshStandardMaterial();
      expect(object.bumpScale).toBe(1);
    });

    test('normalMap', () => {
      const object = new MeshStandardMaterial();
      expect(object.normalMap).toBeNull();
    });

    test('normalMapType', () => {
      const object = new MeshStandardMaterial();
      expect(object.normalMapType).toBe(TangentSpaceNormalMap);
    });

    test('normalScale', () => {
      const object = new MeshStandardMaterial();
      expect(object.normalScale.equals(new Vector2(1, 1))).toBeTruthy();
    });

    test('displacementMap', () => {
      const object = new MeshStandardMaterial();
      expect(object.displacementMap).toBeNull();
    });

    test('displacementScale', () => {
      const object = new MeshStandardMaterial();
      expect(object.displacementScale).toBe(1);
    });

    test('displacementBias', () => {
      const object = new MeshStandardMaterial();
      expect(object.displacementBias).toBe(0);
    });

    test('roughnessMap', () => {
      const object = new MeshStandardMaterial();
      expect(object.roughnessMap).toBeNull();
    });

    test('metalnessMap', () => {
      const object = new MeshStandardMaterial();
      expect(object.metalnessMap).toBeNull();
    });

    test('alphaMap', () => {
      const object = new MeshStandardMaterial();
      expect(object.alphaMap).toBeNull();
    });

    test('envMap', () => {
      const object = new MeshStandardMaterial();
      expect(object.envMap).toBeNull();
    });

    test('envMapIntensity', () => {
      const object = new MeshStandardMaterial();
      expect(object.envMapIntensity).toBe(1.0);
    });

    test('wireframe', () => {
      const object = new MeshStandardMaterial();
      expect(object.wireframe).toBe(false);
    });

    test('wireframeLinewidth', () => {
      const object = new MeshStandardMaterial();
      expect(object.wireframeLinewidth).toBe(1);
    });

    test('flatShading', () => {
      const object = new MeshStandardMaterial();
      expect(object.flatShading).toBe(false);
    });

    test('fog', () => {
      const object = new MeshStandardMaterial();
      expect(object.fog).toBe(true);
    });

    test('copy', () => {
      const object = new MeshStandardMaterial();
      const object2 = new MeshStandardMaterial();

      object2.color = new Color(0x3d3d3d); // diffuse
      object2.roughness = 0.8;
      object2.metalness = 0.1;

      object2.map = new Texture();

      object2.lightMap = new Texture();
      object2.lightMapIntensity = 0.7;

      object2.aoMap = new Texture();
      object2.aoMapIntensity = 0.6;

      object2.emissive = new Color(0x000000);
      object2.emissiveIntensity = 0.5;
      object2.emissiveMap = new Texture();

      object2.bumpMap = new Texture();
      object2.bumpScale = 0.9;

      object2.normalMap = new Texture();
      object2.normalMapType = TangentSpaceNormalMap;
      object2.normalScale = new Vector2(1, 0.8);

      object2.displacementMap = new Texture();
      object2.displacementScale = 0.8;
      object2.displacementBias = 0.1;

      object2.roughnessMap = new Texture();

      object2.metalnessMap = new Texture();

      object2.alphaMap = new Texture();

      object2.envMap = new Texture();
      object2.envMapIntensity = 0.9;

      object2.wireframe = true;
      object2.wireframeLinewidth = 2;

      object2.flatShading = true;

      object2.fog = false;

      object.copy(object2);

      // uuid will be different
      object.uuid = object2.uuid;

      expect(object).not.toBe(object2);
      expect(object).toStrictEqual(object2);
    });
  });
});
