import { beforeAll, describe, expect, it, test, vi } from 'vitest';

import { ObjectLoader } from '@renderlayer/loaders';

import { Light } from '../src/Light.js';
import { AmbientLight } from '../src/AmbientLight.js';

describe('Lights', () => {
  describe('AmbientLight', () => {
    let lights = undefined;

    const parameters = {
      color: 0xaaaaaa,
      intensity: 0.5
    };

    beforeAll(function () {
      // prettier-ignore
      lights = [
				new AmbientLight(),
				new AmbientLight( parameters.color ),
				new AmbientLight( parameters.color, parameters.intensity )
			];
    });

    test('constructor', () => {
      const object = new AmbientLight();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new AmbientLight();
      expect(object).toBeInstanceOf(Light);
    });

    test('isAmbientLight', () => {
      const object = new AmbientLight();
      expect(object.isAmbientLight).toBeTruthy();
    });

    test('type', () => {
      const object = new AmbientLight();
      expect(object.type === 'AmbientLight').toBeTruthy();
    });

    test('dispose', () => {
      const object = new AmbientLight(0xaaaaaa, 0.5);
      object.dispose();

      expect(object).toBeDefined();
    });

    test('copy', () => {
      const a = new AmbientLight(0xaaaaaa, 0.5);
      const b = new AmbientLight();
      b.copy(a);

      expect(b.uuid).not.equal(a.uuid);
      expect(b.id).not.equal(a.id);

      expect(b.color.equals(a.color)).toBeTruthy();
      expect(b.intensity).toEqual(a.intensity);

      b.color.setHex(0xc0ffee);
      expect(a.color.getHex()).not.equal(b.color.getHex());
    });

    test('clone', () => {
      const a = new AmbientLight(0xaaaaaa, 0.5);
      const b = a.clone();

      expect(b.uuid).not.equal(a.uuid);
      expect(b.id).not.equal(a.id);

      expect(b.color.equals(a.color)).toBeTruthy();
      expect(b.intensity).toEqual(a.intensity);

      b.color.setHex(0xc0ffee);
      expect(a.color.getHex()).not.equal(b.color.getHex());
    });

    test('toJSON', () => {
      const light = new AmbientLight(0xffc0d1);
      const json = light.toJSON();
      const object = json.object;

      expect(light.type).toBe(object.type);
      expect(light.uuid).toBe(object.uuid);
      expect(light.color.getHex()).toBe(object.color);
      expect(light.intensity).toBe(object.intensity);

      expect(object.id).toBeUndefined();

      light.uuid = '89b58cca-57ac-4a34-bc71-a82023b91a85';
      expect(light.toJSON()).toMatchInlineSnapshot(`
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
            "type": "AmbientLight",
            "up": [
              0,
              1,
              0,
            ],
            "uuid": "89b58cca-57ac-4a34-bc71-a82023b91a85",
          },
        }
      `);
    });

    test('from ObjectLoader', () => {
      const light = new AmbientLight(0xffc0d1);
      const json = light.toJSON();
      const loader = new ObjectLoader();
      const outputLight = loader.parse(json);

      expect(outputLight).toEqual(light);
    });
  });
});
