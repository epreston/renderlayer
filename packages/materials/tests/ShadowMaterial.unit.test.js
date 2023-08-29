import { describe, expect, it, test, vi } from 'vitest';

import { Color } from '@renderlayer/math';

import { Material } from '../src/Material.js';
import { ShadowMaterial } from '../src/ShadowMaterial.js';

describe('Materials', () => {
  describe('ShadowMaterial', () => {
    test('constructor', () => {
      const object = new ShadowMaterial();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new ShadowMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('isShadowMaterial', () => {
      const object = new ShadowMaterial();
      expect(object.isShadowMaterial).toBeTruthy();
    });

    test('type', () => {
      const object = new ShadowMaterial();
      expect(object.type).toBe('ShadowMaterial');
    });

    test('color', () => {
      const object = new ShadowMaterial();
      expect(object.color.equals(new Color(0x000000))).toBeTruthy();
    });

    test('transparent', () => {
      const object = new ShadowMaterial();
      expect(object.transparent).toBe(true);
    });

    test('fog', () => {
      const object = new ShadowMaterial();
      expect(object.fog).toBe(true);
    });

    test('copy', () => {
      const object = new ShadowMaterial();
      const object2 = new ShadowMaterial();

      object2.transparent = false;
      object2.color = new Color(0x3d3d3d);
      object2.fog = false;

      object.copy(object2);

      // uuid will be different
      object.uuid = object2.uuid;

      expect(object).not.toBe(object2);
      expect(object).toStrictEqual(object2);
    });
  });
});
