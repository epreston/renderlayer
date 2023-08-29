import { describe, expect, it, test, vi } from 'vitest';

import { Color } from '@renderlayer/math';
import { Texture } from '@renderlayer/textures';

import { Material } from '../src/Material.js';
import { LineBasicMaterial } from '../src/LineBasicMaterial.js';

describe('Materials', () => {
  describe('LineBasicMaterial', () => {
    test('constructor', () => {
      const object = new LineBasicMaterial();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new LineBasicMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('isLineBasicMaterial', () => {
      const object = new LineBasicMaterial();
      expect(object.isLineBasicMaterial).toBeTruthy();
    });

    test('type', () => {
      const object = new LineBasicMaterial();
      expect(object.type).toBe('LineBasicMaterial');
    });

    test('color', () => {
      const object = new LineBasicMaterial();
      expect(object.color.equals(new Color(0xffffff))).toBeTruthy();
    });

    test('map', () => {
      const object = new LineBasicMaterial();
      expect(object.map).toBeNull();
    });

    test('linewidth', () => {
      const object = new LineBasicMaterial();
      expect(object.linewidth).toBe(1);
    });

    test('fog', () => {
      const object = new LineBasicMaterial();
      expect(object.fog).toBe(true);
    });

    test('copy', () => {
      const object = new LineBasicMaterial();
      const object2 = new LineBasicMaterial();

      object2.color = new Color(0x3d3d3d);
      object2.map = new Texture();
      object2.linewidth = 2;
      object2.fog = false;

      object.copy(object2);

      // uuid will be different
      object.uuid = object2.uuid;

      expect(object).not.toBe(object2);
      expect(object).toStrictEqual(object2);
    });
  });
});
