import { describe, expect, it, test, vi } from 'vitest';

import { Color } from '@renderlayer/math';
import { Texture } from '@renderlayer/textures';

import { Material } from '../src/Material.js';
import { PointsMaterial } from '../src/PointsMaterial.js';

describe('Materials', () => {
  describe('PointsMaterial', () => {
    test('constructor', () => {
      const object = new PointsMaterial();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new PointsMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('isPointsMaterial', () => {
      const object = new PointsMaterial();
      expect(object.isPointsMaterial).toBeTruthy();
    });

    test('type', () => {
      const object = new PointsMaterial();
      expect(object.type).toBe('PointsMaterial');
    });

    test('color', () => {
      const object = new PointsMaterial();
      expect(object.color.equals(new Color(0xffffff))).toBeTruthy();
    });

    test('map', () => {
      const object = new PointsMaterial();
      expect(object.map).toBeNull();
    });

    test('alphaMap', () => {
      const object = new PointsMaterial();
      expect(object.alphaMap).toBeNull();
    });

    test('size', () => {
      const object = new PointsMaterial();
      expect(object.size).toBe(1);
    });

    test('sizeAttenuation', () => {
      const object = new PointsMaterial();
      expect(object.sizeAttenuation).toBe(true);
    });

    test('fog', () => {
      const object = new PointsMaterial();
      expect(object.fog).toBe(true);
    });

    test('copy', () => {
      const object = new PointsMaterial();
      const object2 = new PointsMaterial();

      object2.color = new Color(0x3d3d3d);
      object.map = new Texture();
      object.alphaMap = new Texture();
      object.size = 2;
      object.sizeAttenuation = false;
      object2.fog = false;

      object.copy(object2);

      // uuid will be different
      object.uuid = object2.uuid;

      expect(object).not.toBe(object2);
      expect(object).toStrictEqual(object2);
    });
  });
});
