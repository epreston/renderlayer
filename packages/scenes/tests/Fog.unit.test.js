import { describe, expect, it, test, vi } from 'vitest';

import { Fog } from '../src/Fog.js';

describe('Scenes', () => {
  describe('Fog', () => {
    test('constructor', () => {
      // Fog( color, near = 1, far = 1000 )

      // no params
      const object = new Fog();
      expect(object).toBeDefined();

      // color
      const object_color = new Fog(0xffffff);
      expect(object_color).toBeDefined();

      // color, near, far
      const object_all = new Fog(0xffffff, 0.015, 100);
      expect(object_all).toBeDefined();
    });

    test('isFog', () => {
      const object = new Fog();
      expect(object.isFog).toBeTruthy();
    });

    test('name', () => {
      const object = new Fog();
      expect(object.name).toBe('');
    });

    test('color', () => {
      const object = new Fog(0xffffff, 0.015, 100);
      expect(object.color.getHex()).toEqual(0xffffff);
    });

    test('near', () => {
      const object = new Fog(0xffffff, 0.015, 100);
      expect(object.near).toEqual(0.015);
    });

    test('far', () => {
      const object = new Fog(0xffffff, 0.015, 100);
      expect(object.far).toEqual(100);
    });

    test('clone', () => {
      const object = new Fog(0xffffff, 0.015, 100);
      const clonedObject = object.clone();

      expect(clonedObject).not.toBe(object);
      expect(clonedObject).toStrictEqual(object);
    });

    test('toJSON', () => {
      const object = new Fog();
      expect(object).toMatchInlineSnapshot(`
        {
          "color": 16777215,
          "far": 1000,
          "near": 1,
          "type": "Fog",
        }
      `);
    });
  });
});
