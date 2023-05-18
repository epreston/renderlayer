import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { LightShadow } from '../src/LightShadow.js';
import { SpotLight } from '../src/SpotLight.js';
import { SpotLightShadow } from '../src/SpotLightShadow.js';

describe('Lights', () => {
  describe('SpotLightShadow', () => {
    test('Instancing', () => {
      const object = new SpotLightShadow();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new SpotLightShadow();
      expect(object).toBeInstanceOf(LightShadow);
    });

    test.todo('focus', () => {
      // implement
    });

    test('isSpotLightShadow', () => {
      const object = new SpotLightShadow();
      expect(object.isSpotLightShadow).toBeTruthy();
    });

    test.todo('updateMatrices', () => {
      // implement
    });

    test.todo('copy', () => {
      // implement
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
      // expect(a).toEqual(b);

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

      // const json = light.toJSON();
      // const newLight = new ObjectLoader().parse(json);

      // expect(newLight.shadow).toEqual(light.shadow);
    });
  });
});
