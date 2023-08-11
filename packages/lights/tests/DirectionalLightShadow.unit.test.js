import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { ObjectLoader } from '@renderlayer/loaders';

import { LightShadow } from '../src/LightShadow.js';
import { DirectionalLight } from '../src/DirectionalLight.js';
import { DirectionalLightShadow } from '../src/DirectionalLightShadow.js';

describe('Lights', () => {
  describe('DirectionalLightShadow', () => {
    test('Instancing', () => {
      const object = new DirectionalLightShadow();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
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
      // expect(a).toEqual(c); // Shadows are identical after clone

      c.mapSize.set(1024, 1024);
      expect(a).not.toEqual(c);

      // b.copy(a);
      // expect(a).toEqual(b); // Shadows are identical after copy

      b.mapSize.set(512, 512);
      expect(a).not.toEqual(b);
    });

    test('toJSON', () => {
      const light = new DirectionalLight();
      const shadow = new DirectionalLightShadow();

      shadow.bias = 10;
      shadow.radius = 5;
      shadow.mapSize.set(1024, 1024);
      light.shadow = shadow;

      const json = light.toJSON();
      const newLight = new ObjectLoader().parse(json);

      // Reloaded shadow is identical to the original one
      expect(newLight.shadow).toEqual(light.shadow);
    });
  });
});
