import { describe, expect, it, test, vi } from 'vitest';

import { Color } from '@renderlayer/math';
import { Texture } from '@renderlayer/textures';

import { Material } from '../src/Material.js';
import { SpriteMaterial } from '../src/SpriteMaterial.js';

describe('Materials', () => {
  describe('SpriteMaterial', () => {
    test('constructor', () => {
      const object = new SpriteMaterial();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new SpriteMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('isSpriteMaterial', () => {
      const object = new SpriteMaterial();
      expect(object.isSpriteMaterial).toBeTruthy();
    });

    test('type', () => {
      const object = new SpriteMaterial();
      expect(object.type).toBe('SpriteMaterial');
    });

    test('transparent', () => {
      const object = new SpriteMaterial();
      expect(object.transparent).toBe(true);
    });

    test('color', () => {
      const object = new SpriteMaterial();
      expect(object.color.equals(new Color(0xffffff))).toBeTruthy();
    });

    test('map', () => {
      const object = new SpriteMaterial();
      expect(object.map).toBeNull();
    });

    test('alphaMap', () => {
      const object = new SpriteMaterial();
      expect(object.alphaMap).toBeNull();
    });

    test('rotation', () => {
      const object = new SpriteMaterial();
      expect(object.rotation).toBe(0);
    });

    test('sizeAttenuation', () => {
      const object = new SpriteMaterial();
      expect(object.sizeAttenuation).toBe(true);
    });

    test('fog', () => {
      const object = new SpriteMaterial();
      expect(object.fog).toBe(true);
    });

    test('copy', () => {
      const object = new SpriteMaterial();
      const object2 = new SpriteMaterial();

      expect(object.transparent).toBe(true);
      expect(object.color.equals(new Color(0xffffff))).toBeTruthy();
      expect(object.map).toBeNull();
      expect(object.alphaMap).toBeNull();
      expect(object.rotation).toBe(0);
      expect(object.sizeAttenuation).toBe(true);
      expect(object.fog).toBe(true);

      object2.transparent = false;
      object2.color = new Color(0x3d3d3d);
      object2.map = new Texture();
      object2.alphaMap = new Texture();
      object2.rotation = 45;
      object2.sizeAttenuation = false;
      object2.fog = false;

      object.copy(object2);

      expect(object).not.toBe(object2);

      expect(object.transparent).toBe(object2.transparent);
      expect(object.color.equals(object2.color)).toBeTruthy();
      expect(object.map).toBe(object2.map);
      expect(object.alphaMap).toBe(object2.alphaMap);
      expect(object.rotation).toBe(object2.rotation);
      expect(object.sizeAttenuation).toBe(object2.sizeAttenuation);
      expect(object.fog).toBe(object2.fog);
    });
  });
});
