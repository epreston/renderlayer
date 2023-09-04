import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { ObjectLoader } from '@renderlayer/loaders';

import { Light } from '../src/Light.js';
import { SpotLight } from '../src/SpotLight.js';

describe('Lights', () => {
  describe('SpotLight', () => {
    let lights = undefined;

    beforeAll(function () {
      const parameters = {
        color: 0xaaaaaa,
        intensity: 0.5,
        distance: 100,
        angle: 0.8,
        penumbra: 8,
        decay: 2
      };

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

    test.todo('position', () => {
      // implement
    });

    test.todo('target', () => {
      // implement
    });

    test.todo('distance', () => {
      // implement
    });

    test.todo('angle', () => {
      // implement
    });

    test.todo('penumbra', () => {
      // implement
    });

    test.todo('decay', () => {
      // implement
    });

    test.todo('map', () => {
      // implement
    });

    test.todo('shadow', () => {
      // implement
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

      expect(json.metadata.version).toBe(4.5);

      const object = json.object;

      expect(light.type).toBe(object.type);
      expect(light.uuid).toBe(object.uuid);
      expect(light.color.getHex()).toBe(object.color);
      expect(light.intensity).toBe(object.intensity);

      expect(object.id).toBeUndefined();

      const loader = new ObjectLoader();
      const outputLight = loader.parse(json);

      // will be different
      outputLight.target.uuid = light.target.uuid;

      expect(outputLight).toStrictEqual(light);
    });
  });
});
