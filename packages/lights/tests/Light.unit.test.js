import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

// import { ObjectLoader } from '@renderlayer/loaders';
import { Object3D } from '@renderlayer/core';
import { Light } from '../src/Light.js';

describe('Lights', () => {
  describe('Light', () => {
    test('Instancing', () => {
      const object = new Light();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new Light();
      expect(object).toBeInstanceOf(Object3D);
    });

    test('type', () => {
      const object = new Light(0xaaaaaa);
      expect(object.type === 'Light').toBeTruthy();
    });

    test('color', () => {
      const object = new Light(0xaaaaaa, 0.5);
      expect(object.color.getHex()).toEqual(0xaaaaaa);
    });

    test('intensity', () => {
      const object = new Light(0xaaaaaa, 0.5);
      expect(object.intensity).toEqual(0.5);
    });

    test('isLight', () => {
      const object = new Light(0xaaaaaa);
      expect(object.isLight).toBeTruthy();
    });

    test('dispose', () => {
      const object = new Light(0xaaaaaa, 0.5);
      object.dispose();

      expect(object).toBeDefined();
    });

    test('copy', () => {
      const a = new Light(0xaaaaaa, 0.5);
      const b = new Light();
      b.copy(a);

      expect(b.uuid).not.equal(a.uuid);
      expect(b.id).not.equal(a.id);

      expect(b.color.equals(a.color)).toBeTruthy();
      expect(b.intensity).toEqual(a.intensity);

      b.color.setHex(0xc0ffee);
      expect(a.color.getHex()).not.equal(b.color.getHex());
    });

    test('clone', () => {
      const a = new Light(0xaaaaaa, 0.5);
      const b = a.clone();

      expect(b.uuid).not.equal(a.uuid);
      expect(b.id).not.equal(a.id);

      expect(b.color.equals(a.color)).toBeTruthy();
      expect(b.intensity).toEqual(a.intensity);

      b.color.setHex(0xc0ffee);
      expect(a.color.getHex()).not.equal(b.color.getHex());
    });

    test.todo('toJSON', () => {
      const light = new Light(0xffc0d1);
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
