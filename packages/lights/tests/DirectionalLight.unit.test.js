import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Light } from '../src/Light.js';
import { DirectionalLight } from '../src/DirectionalLight.js';

describe('Lights', () => {
  describe('DirectionalLight', () => {
    let lights = undefined;

    beforeAll(function () {
      const parameters = {
        color: 0xaaaaaa,
        intensity: 0.8,
      };

      lights = [
        new DirectionalLight(),
        new DirectionalLight(parameters.color),
        new DirectionalLight(parameters.color, parameters.intensity),
      ];
    });

    test('Instancing', () => {
      const object = new DirectionalLight();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new DirectionalLight();
      expect(object).toBeInstanceOf(Light);
    });

    test('type', () => {
      const object = new DirectionalLight();
      expect(object.type === 'DirectionalLight').toBeTruthy();
    });

    test.todo('position', () => {
      // implement
    });

    test.todo('target', () => {
      // implement
    });

    test.todo('shadow', () => {
      // implement
    });

    test('isDirectionalLight', () => {
      const object = new DirectionalLight();
      expect(object.isDirectionalLight).toBeTruthy();
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

    test.todo('toJSON', () => {
      const light = new DirectionalLight(0xffc0d1);
      const json = light.toJSON();

      expect(json.metadata.version).toBe('4.5');

      const object = json.object;

      expect(light.type).toBe(object.type);
      expect(light.uuid).toBe(object.uuid);
      expect(light.color.getHex()).toBe(object.color);
      expect(light.intensity).toBe(object.intensity);

      expect(object.id).toBeUndefined();

      // const loader = new ObjectLoader();
      // const outputLight = loader.parse(json);
      // expect(outputLight).toEqual(light);
    });
  });
});
