import { describe, expect, it, test, vi } from 'vitest';

// import { ObjectLoader } from '@renderlayer/loaders';
import { Object3D } from '@renderlayer/core';
import { Light } from '../src/Light.js';

describe('Lights', () => {
  describe('Light', () => {
    test('constructor', () => {
      const object = new Light();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new Light();
      expect(object).toBeInstanceOf(Object3D);
    });

    test('isLight', () => {
      const object = new Light(0xaaaaaa);
      expect(object.isLight).toBeTruthy();
    });

    test('type', () => {
      const object = new Light(0xaaaaaa);
      expect(object.type).toBe('Light');
    });

    test('color', () => {
      const object = new Light(0xaaaaaa, 0.5);
      expect(object.color.getHex()).toEqual(0xaaaaaa);
    });

    test('intensity', () => {
      const object = new Light(0xaaaaaa, 0.5);
      expect(object.intensity).toEqual(0.5);
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

    test('toJSON', () => {
      const light = new Light(0xffc0d1);

      light.uuid = '43bbf855-85e8-4fab-93d8-31f471ff68e7';

      expect(light).toMatchInlineSnapshot(`
        {
          "metadata": {
            "generator": "Object3D.toJSON",
            "type": "Object",
            "version": 4.5,
          },
          "object": {
            "color": 16761041,
            "intensity": 1,
            "layers": 1,
            "matrix": [
              1,
              0,
              0,
              0,
              0,
              1,
              0,
              0,
              0,
              0,
              1,
              0,
              0,
              0,
              0,
              1,
            ],
            "type": "Light",
            "up": [
              0,
              1,
              0,
            ],
            "uuid": "43bbf855-85e8-4fab-93d8-31f471ff68e7",
          },
        }
      `);
    });
  });
});
