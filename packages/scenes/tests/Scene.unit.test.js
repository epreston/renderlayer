import { describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
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

    test.todo('type', () => {
      // implement
    });

    test.todo('background', () => {
      // implement
    });

    test.todo('environment', () => {
      // implement
    });

    test.todo('fog', () => {
      // implement
    });

    test.todo('backgroundBlurriness', () => {
      // implement
    });

    test.todo('backgroundIntensity', () => {
      // implement
    });

    test.todo('overrideMaterial', () => {
      // implement
    });

    test.todo('copy', () => {
      // implement
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
  });
});
