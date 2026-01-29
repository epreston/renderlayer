import { beforeAll, describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { ObjectLoader } from '@renderlayer/loaders';

import { Light } from '../src/Light.js';
import { DirectionalLight } from '../src/DirectionalLight.js';
import { DirectionalLightShadow } from '../src/DirectionalLightShadow.js';

describe('Lights', () => {
  describe('DirectionalLight', () => {
    let _lights = undefined;

    const _parameters = {
      color: 0xaaaaaa,
      intensity: 0.8
    };

    beforeAll(function () {
      _lights = [
        new DirectionalLight(),
        new DirectionalLight(_parameters.color),
        new DirectionalLight(_parameters.color, _parameters.intensity)
      ];
    });

    test('constructor', () => {
      const object = new DirectionalLight();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new DirectionalLight();
      expect(object).toBeInstanceOf(Light);
    });

    test('isDirectionalLight', () => {
      const object = new DirectionalLight();
      expect(object.isDirectionalLight).toBeTruthy();
    });

    test('type', () => {
      const object = new DirectionalLight();
      expect(object.type).toBe('DirectionalLight');
    });

    test('position', () => {
      const object = new DirectionalLight();
      expect(object.position.equals(Object3D.DEFAULT_UP)).toBeTruthy();
    });

    test('target', () => {
      const object = new DirectionalLight();
      expect(object.target).toBeInstanceOf(Object3D);
    });

    test('shadow', () => {
      const object = new DirectionalLight();
      expect(object.shadow).toBeInstanceOf(DirectionalLightShadow);
    });

    test('dispose', () => {
      const object = new DirectionalLight();
      object.dispose();

      expect(object).toBeDefined();

      // ensure calls dispose() on shadow
    });

    test('copy', () => {
      const a = new DirectionalLight(0xaaaaaa, 0.5);
      const b = new DirectionalLight();
      b.copy(a);

      expect(b.uuid).not.equal(a.uuid);
      expect(b.id).not.equal(a.id);

      expect(b.color.equals(a.color)).toBeTruthy();
      expect(b.intensity).toEqual(a.intensity);

      b.color.setHex(0xc0ffee);
      expect(a.color.getHex()).not.equal(b.color.getHex());
    });

    test('clone', () => {
      const a = new DirectionalLight(0xaaaaaa, 0.5);
      const b = a.clone();

      expect(b.uuid).not.equal(a.uuid);
      expect(b.id).not.equal(a.id);

      expect(b.color.equals(a.color)).toBeTruthy();
      expect(b.intensity).toEqual(a.intensity);

      b.color.setHex(0xc0ffee);
      expect(a.color.getHex()).not.equal(b.color.getHex());
    });

    test('toJSON', () => {
      const light = new DirectionalLight(0xffc0d1);
      const json = light.toJSON();
      const object = json.object;

      expect(light.type).toBe(object.type);
      expect(light.uuid).toBe(object.uuid);
      expect(light.color.getHex()).toBe(object.color);
      expect(light.intensity).toBe(object.intensity);

      expect(object.id).toBeUndefined();
    });

    test('from ObjectLoader', () => {
      const light = new DirectionalLight(0xffc0d1);
      const json = light.toJSON();
      const loader = new ObjectLoader();
      const outputLight = loader.parse(json);

      // @ts-ignore - will be different
      outputLight.target.uuid = light.target.uuid;

      expect(outputLight).toEqual(light);
    });
  });
});
