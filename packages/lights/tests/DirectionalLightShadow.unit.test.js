import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { ObjectLoader } from '@renderlayer/loaders';

import { LightShadow } from '../src/LightShadow.js';
import { DirectionalLight } from '../src/DirectionalLight.js';
import { DirectionalLightShadow } from '../src/DirectionalLightShadow.js';

describe('Lights', () => {
  describe('DirectionalLightShadow', () => {
    test('constructor', () => {
      const object = new DirectionalLightShadow();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new DirectionalLightShadow();
      expect(object).toBeInstanceOf(LightShadow);
    });

    test('isDirectionalLightShadow', () => {
      const object = new DirectionalLightShadow();
      expect(object.isDirectionalLightShadow).toBeTruthy();
    });

    test('clone/copy', () => {
      const a = new DirectionalLightShadow();
      const b = new DirectionalLightShadow();

      expect(a).not.toEqual(b);

      const c = a.clone();
      a.camera.uuid = c.camera.uuid;
      expect(a).toEqual(c); // Shadows are identical after clone

      c.mapSize.set(1024, 1024);
      expect(a).not.toEqual(c);

      b.copy(a);
      a.camera.uuid = b.camera.uuid;
      expect(a).toEqual(b); // Shadows are identical after copy

      b.mapSize.set(256, 256);
      expect(a).not.toEqual(b);
    });

    test('toJSON', () => {
      const light = new DirectionalLight();
      const shadow = new DirectionalLightShadow();

      shadow.bias = 10;
      shadow.radius = 5;
      shadow.mapSize.set(1024, 1024);
      light.shadow = shadow;

      light.shadow.camera.uuid = 'a577697e-4765-49a2-9891-fe5042b5cb53';
      expect(light.shadow).toMatchInlineSnapshot(`
        {
          "bias": 10,
          "camera": {
            "bottom": -5,
            "far": 500,
            "layers": 1,
            "left": -5,
            "near": 0.5,
            "right": 5,
            "top": 5,
            "type": "OrthographicCamera",
            "up": [
              0,
              1,
              0,
            ],
            "uuid": "a577697e-4765-49a2-9891-fe5042b5cb53",
            "zoom": 1,
          },
          "mapSize": [
            1024,
            1024,
          ],
          "radius": 5,
        }
      `);
    });

    test('from ObjectLoader', () => {
      const light = new DirectionalLight();
      const shadow = new DirectionalLightShadow();

      light.shadow = shadow;

      const json = light.toJSON();
      const loader = new ObjectLoader();
      const newLight = loader.parse(json);

      // Reloaded shadow is identical to the original one
      expect(newLight.shadow).toEqual(light.shadow);
    });
  });
});
