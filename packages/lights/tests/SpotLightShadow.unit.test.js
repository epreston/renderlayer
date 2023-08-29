import { describe, expect, it, test, vi } from 'vitest';

import { LightShadow } from '../src/LightShadow.js';
import { SpotLight } from '../src/SpotLight.js';
import { SpotLightShadow } from '../src/SpotLightShadow.js';

describe('Lights', () => {
  describe('SpotLightShadow', () => {
    test('constructor', () => {
      const object = new SpotLightShadow();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new SpotLightShadow();
      expect(object).toBeInstanceOf(LightShadow);
    });

    test('focus', () => {
      const object = new SpotLightShadow();
      expect(object.focus).toBe(1);
    });

    test('isSpotLightShadow', () => {
      const object = new SpotLightShadow();
      expect(object.isSpotLightShadow).toBeTruthy();
    });

    test.todo('updateMatrices', () => {
      // implement
    });

    test('copy', () => {
      const a = new SpotLightShadow();
      const b = new SpotLightShadow();

      b.bias = 10;
      b.radius = 5;
      b.mapSize.set(128, 128);
      b.focus = 1.2;

      expect(a).not.toBe(b);
      expect(a.bias).not.toEqual(b.bias);
      expect(a.radius).not.toBe(b.radius);
      expect(a.mapSize.equals(b.mapSize)).toBeFalsy();
      expect(a.focus).not.toBe(b.focus);

      a.copy(b);

      expect(a).not.toBe(b);
      expect(a.bias).toEqual(b.bias);
      expect(a.radius).toBe(b.radius);
      expect(a.mapSize.equals(b.mapSize)).toBeTruthy();
      expect(a.focus).toBe(b.focus);
    });

    test('clone/copy', () => {
      const a = new SpotLightShadow();
      const b = new SpotLightShadow();

      expect(a).not.toEqual(b);

      const c = a.clone();
      c.camera.uuid = a.camera.uuid; // cheat
      expect(a).toEqual(c);

      c.mapSize.set(256, 256);
      expect(a).not.toEqual(b);

      b.copy(a);
      expect(a).not.toBe(b);
      expect(a.bias).toEqual(b.bias);
      expect(a.radius).toBe(b.radius);
      expect(a.mapSize.equals(b.mapSize)).toBeTruthy();
      expect(a.focus).toBe(b.focus);

      b.mapSize.set(512, 512);
      expect(a).not.toEqual(b);
    });

    test('toJSON', () => {
      const light = new SpotLight();
      const shadow = new SpotLightShadow();

      shadow.bias = 10;
      shadow.radius = 5;
      shadow.mapSize.set(128, 128);
      light.shadow = shadow;

      shadow.camera.uuid = '7fbc9b8d-a570-4f6b-9ad4-b08b4ab74a45';
      expect(shadow.toJSON()).toMatchInlineSnapshot(`
        {
          "bias": 10,
          "camera": {
            "aspect": 1,
            "far": 500,
            "filmGauge": 35,
            "filmOffset": 0,
            "focus": 10,
            "fov": 50,
            "layers": 1,
            "near": 0.5,
            "type": "PerspectiveCamera",
            "up": [
              0,
              1,
              0,
            ],
            "uuid": "7fbc9b8d-a570-4f6b-9ad4-b08b4ab74a45",
            "zoom": 1,
          },
          "mapSize": [
            128,
            128,
          ],
          "radius": 5,
        }
      `);
    });
  });
});
