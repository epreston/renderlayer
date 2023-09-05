import { beforeAll, describe, expect, it, test, vi } from 'vitest';

import { ObjectLoader } from '@renderlayer/loaders';

import { Light } from '../src/Light.js';
import { PointLight } from '../src/PointLight.js';
import { PointLightShadow } from '../src/PointLightShadow.js';

describe('Lights', () => {
  describe('PointLight', () => {
    let lights = undefined;

    const parameters = {
      color: 0xaaaaaa,
      intensity: 0.5,
      distance: 100,
      decay: 2
    };

    beforeAll(function () {
      lights = [
        new PointLight(),
        new PointLight(parameters.color),
        new PointLight(parameters.color, parameters.intensity),
        new PointLight(parameters.color, parameters.intensity, parameters.distance),
        new PointLight(
          parameters.color,
          parameters.intensity,
          parameters.distance,
          parameters.decay
        )
      ];
    });

    test('constructor', () => {
      const object = new PointLight();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new PointLight();
      expect(object).toBeInstanceOf(Light);
    });

    test('isPointLight', () => {
      const object = new PointLight();
      expect(object.isPointLight).toBeTruthy();
    });

    test('type', () => {
      const object = new PointLight();
      expect(object.type).toBe('PointLight');
    });

    test('distance', () => {
      expect(lights[2].distance).toBe(0);

      expect(lights[3].distance).toBe(parameters.distance);
    });

    test('decay', () => {
      expect(lights[3].decay).toBe(2);

      expect(lights[4].decay).toBe(parameters.decay);
    });

    test('shadow', () => {
      const object = new PointLight();
      expect(object.shadow).toBeInstanceOf(PointLightShadow);
    });

    test('power', () => {
      const a = new PointLight(0xaaaaaa);

      a.intensity = 100;
      expect(a.power).toBeCloseTo(100 * Math.PI * 4);

      a.intensity = 40;
      expect(a.power).toBeCloseTo(40 * Math.PI * 4);

      a.power = 100;
      expect(a.intensity).toBeCloseTo(100 / (4 * Math.PI));
    });

    test('dispose', () => {
      const object = new PointLight();
      object.dispose();

      expect(object).toBeDefined();

      // ensure calls dispose() on shadow
    });

    test('copy', () => {
      const a = new PointLight(0xaaaaaa, 0.5);
      const b = new PointLight();
      b.copy(a);

      expect(b.uuid).not.equal(a.uuid);
      expect(b.id).not.equal(a.id);

      expect(b.color.equals(a.color)).toBeTruthy();
      expect(b.intensity).toEqual(a.intensity);

      b.color.setHex(0xc0ffee);
      expect(a.color.getHex()).not.equal(b.color.getHex());
    });

    test('clone', () => {
      const a = new PointLight(0xaaaaaa, 0.5);
      const b = a.clone();

      expect(b.uuid).not.equal(a.uuid);
      expect(b.id).not.equal(a.id);

      expect(b.color.equals(a.color)).toBeTruthy();
      expect(b.intensity).toEqual(a.intensity);

      b.color.setHex(0xc0ffee);
      expect(a.color.getHex()).not.equal(b.color.getHex());
    });

    test('toJSON', () => {
      const light = new PointLight(0xffc0d1);
      const json = light.toJSON();
      const object = json.object;

      expect(light.type).toBe(object.type);
      expect(light.uuid).toBe(object.uuid);
      expect(light.color.getHex()).toBe(object.color);
      expect(light.intensity).toBe(object.intensity);

      expect(object.id).toBeUndefined();
    });

    test('from ObjectLoader', () => {
      const light = new PointLight(0xffc0d1);
      const json = light.toJSON();
      const loader = new ObjectLoader();
      const outputLight = loader.parse(json);

      expect(outputLight).toEqual(light);
    });
  });
});
