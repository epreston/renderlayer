import { beforeAll, describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { ObjectLoader } from '@renderlayer/loaders';

import { Light } from '../src/Light.js';
import { SpotLight } from '../src/SpotLight.js';
import { SpotLightShadow } from '../src/SpotLightShadow.js';

describe('Lights', () => {
  describe('SpotLight', () => {
    let lights = undefined;

    const parameters = {
      color: 0xaaaaaa,
      intensity: 0.5,
      distance: 100,
      angle: 0.8,
      penumbra: 8,
      decay: 2
    };

    beforeAll(function () {
      lights = [
        new SpotLight(parameters.color),
        new SpotLight(parameters.color, parameters.intensity),
        new SpotLight(parameters.color, parameters.intensity, parameters.distance),
        new SpotLight(
          parameters.color,
          parameters.intensity,
          parameters.distance,
          parameters.angle
        ),
        new SpotLight(
          parameters.color,
          parameters.intensity,
          parameters.distance,
          parameters.angle,
          parameters.penumbra
        ),
        new SpotLight(
          parameters.color,
          parameters.intensity,
          parameters.distance,
          parameters.angle,
          parameters.penumbra,
          parameters.decay
        )
      ];
    });

    test('constructor', () => {
      const object = new SpotLight();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new SpotLight();
      expect(object).toBeInstanceOf(Light);
    });

    test('type', () => {
      const object = new SpotLight();
      expect(object.type).toBe('SpotLight');
    });

    test('position', () => {
      const object = new SpotLight();
      expect(object.position.equals(Object3D.DEFAULT_UP)).toBeTruthy();
    });

    test('target', () => {
      const object = new SpotLight();
      expect(object.target).toBeInstanceOf(Object3D);
    });

    test('distance', () => {
      expect(lights[1].distance).toBe(0);

      expect(lights[2].distance).toBe(parameters.distance);
    });

    test('angle', () => {
      expect(lights[2].angle).toBe(Math.PI / 3);

      expect(lights[3].angle).toBe(parameters.angle);
    });

    test('penumbra', () => {
      expect(lights[3].penumbra).toBe(0);

      expect(lights[4].penumbra).toBe(parameters.penumbra);
    });

    test('decay', () => {
      expect(lights[4].decay).toBe(2);

      expect(lights[5].decay).toBe(parameters.decay);
    });

    test('map', () => {
      const object = new SpotLight();
      expect(object.map).toBeNull();
    });

    test('shadow', () => {
      const object = new SpotLight();
      expect(object.shadow).toBeInstanceOf(SpotLightShadow);
    });

    test('power', () => {
      const a = new SpotLight(0xaaaaaa);

      a.intensity = 100;
      expect(a.power).toBeCloseTo(100 * Math.PI);

      a.intensity = 40;
      expect(a.power).toBeCloseTo(40 * Math.PI);

      a.power = 100;
      expect(a.intensity).toBeCloseTo(100 / Math.PI);
    });

    test('isSpotLight', () => {
      const object = new SpotLight();
      expect(object.isSpotLight).toBeTruthy();
    });

    test('dispose', () => {
      const object = new SpotLight();
      object.dispose();

      expect(object).toBeDefined();

      // ensure calls dispose() on shadow
    });

    test('copy', () => {
      const a = new SpotLight(0xaaaaaa, 0.5);
      const b = new SpotLight();
      b.copy(a);

      expect(b.uuid).not.equal(a.uuid);
      expect(b.id).not.equal(a.id);

      expect(b.color.equals(a.color)).toBeTruthy();
      expect(b.intensity).toEqual(a.intensity);

      b.color.setHex(0xc0ffee);
      expect(a.color.getHex()).not.equal(b.color.getHex());
    });

    test('clone', () => {
      const a = new SpotLight(0xaaaaaa, 0.5);
      const b = a.clone();

      expect(b.uuid).not.equal(a.uuid);
      expect(b.id).not.equal(a.id);

      expect(b.color.equals(a.color)).toBeTruthy();
      expect(b.intensity).toEqual(a.intensity);

      b.color.setHex(0xc0ffee);
      expect(a.color.getHex()).not.equal(b.color.getHex());
    });

    test('toJSON', () => {
      const light = new SpotLight(0xffc0d1);
      const json = light.toJSON();

      const object = json.object;

      expect(light.type).toBe(object.type);
      expect(light.uuid).toBe(object.uuid);
      expect(light.color.getHex()).toBe(object.color);
      expect(light.intensity).toBe(object.intensity);

      expect(object.id).toBeUndefined();
    });

    test('from ObjectLoader', () => {
      const light = new SpotLight(0xffc0d1);
      const json = light.toJSON();
      const loader = new ObjectLoader();
      const outputLight = loader.parse(json);

      // will be different
      outputLight.target.uuid = light.target.uuid;

      expect(outputLight).toEqual(light);
    });
  });
});
