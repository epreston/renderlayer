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

      object2.transparent = false;
      object2.color = new Color(0x3d3d3d);
      object2.map = new Texture();
      object2.alphaMap = new Texture();
      object2.rotation = 45;
      object2.sizeAttenuation = false;
      object2.fog = false;

      object.copy(object2);

      // uuid will be different
      object.uuid = object2.uuid;

      expect(object).not.toBe(object2);
      expect(object).toStrictEqual(object2);
    });
  });
});
