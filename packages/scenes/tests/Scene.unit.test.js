import { describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { ObjectLoader } from '@renderlayer/loaders';
import { Color } from '@renderlayer/math';

import { Fog } from '../src/Fog.js';
import { Scene } from '../src/Scene.js';

describe('Scenes', () => {
  describe('Scene', () => {
    test('extends', () => {
      const object = new Scene();
      expect(object).toBeInstanceOf(Object3D);
    });

    test('constructor', () => {
      const object = new Scene();
      expect(object).toBeDefined();
    });

    test('isScene', () => {
      const object = new Scene();
      expect(object.isScene).toBeTruthy();
    });

    test('type', () => {
      const object = new Scene();
      expect(object.type).toBe('Scene');
    });

    test('background', () => {
      const object = new Scene();
      expect(object.background).toBeNull();
    });

    test('environment', () => {
      const object = new Scene();
      expect(object.environment).toBeNull();
    });

    test('fog', () => {
      const object = new Scene();
      expect(object.fog).toBeNull();
    });

    test('backgroundBlurriness', () => {
      const object = new Scene();
      expect(object.backgroundBlurriness).toBe(0);
    });

    test('backgroundIntensity', () => {
      const object = new Scene();
      expect(object.backgroundIntensity).toBe(1);
    });

    test('overrideMaterial', () => {
      const object = new Scene();
      expect(object.overrideMaterial).toBeNull();
    });

    test('copy', () => {
      const src = new Scene();
      const dst = new Scene();

      dst.copy(src);

      // will be different
      dst.uuid = src.uuid;

      expect(dst).not.toBe(src);
      expect(dst).toStrictEqual(src);
    });

    test('toJSON', () => {
      const object = new Scene();
      object.uuid = '92ff990a-5092-466b-8642-bf028acf7cac';
      expect(object).toMatchInlineSnapshot(`
        {
          "metadata": {
            "generator": "Object3D.toJSON",
            "type": "Object",
            "version": 4.5,
          },
          "object": {
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
            "type": "Scene",
            "up": [
              0,
              1,
              0,
            ],
            "uuid": "92ff990a-5092-466b-8642-bf028acf7cac",
          },
        }
      `);
    });

    test('from ObjectLoader', () => {
      const object = new Scene();

      object.background = new Color();
      object.fog = new Fog();

      const json = object.toJSON();
      const loader = new ObjectLoader();
      const outputObject = loader.parse(json);

      expect(outputObject).toStrictEqual(object);
    });
  });
});
