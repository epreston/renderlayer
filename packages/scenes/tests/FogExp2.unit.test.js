import { describe, expect, it, test, vi } from 'vitest';

import { FogExp2 } from '../src/FogExp2.js';

describe('Scenes', () => {
  describe('FoxExp2', () => {
    test('constructor', () => {
      // FoxExp2( color, density = 0.00025 )

      // no params
      const object = new FogExp2();
      expect(object).toBeDefined();

      // color
      const object_color = new FogExp2(0xffffff);
      expect(object_color).toBeDefined();

      // color, density
      const object_all = new FogExp2(0xffffff, 0.0003);
      expect(object_all).toBeDefined();
    });

    test('isFogExp2', () => {
      const object = new FogExp2();
      expect(object.isFogExp2).toBeTruthy();
    });

    test('name', () => {
      const object = new FogExp2();
      expect(object.name).toBe('');
    });

    test('color', () => {
      const object = new FogExp2(0xffffff, 0.0003);
      expect(object.color.getHex()).toEqual(0xffffff);
    });

    test('density', () => {
      const object = new FogExp2(0xffffff, 0.0003);
      expect(object.density).toEqual(0.0003);
    });

    test('clone', () => {
      const object = new FogExp2(0xffffff, 0.0003);
      const clonedObject = object.clone();

      expect(clonedObject).not.toBe(object);
      expect(clonedObject).toStrictEqual(object);
    });

    test('toJSON', () => {
      const object = new FogExp2();
      expect(object).toMatchInlineSnapshot(`
        {
          "color": 16777215,
          "density": 0.00025,
          "type": "FogExp2",
        }
      `);
    });
  });
});
