import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { BufferGeometry } from '@renderlayer/buffers';
import { PlaneGeometry } from '../src/PlaneGeometry.js';

describe('Geometries', () => {
  describe('PlaneGeometry', () => {
    let geometries = undefined;

    beforeEach(() => {
      const parameters = {
        width: 10,
        height: 30,
        widthSegments: 3,
        heightSegments: 5
      };

      geometries = [
        new PlaneGeometry(),
        new PlaneGeometry(parameters.width),
        new PlaneGeometry(parameters.width, parameters.height),
        new PlaneGeometry(parameters.width, parameters.height, parameters.widthSegments),
        new PlaneGeometry(
          parameters.width,
          parameters.height,
          parameters.widthSegments,
          parameters.heightSegments
        )
      ];
    });

    test('Instancing', () => {
      const object = new PlaneGeometry();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new PlaneGeometry();
      expect(object).toBeInstanceOf(BufferGeometry);
    });

    test('type', () => {
      const object = new PlaneGeometry();
      expect(object.type === 'PlaneGeometry').toBeTruthy();
    });

    test.todo('parameters', () => {
      // implement
    });

    test('clone', () => {
      geometries.forEach((geometry) => {
        const clone = geometry.clone();

        expect(clone).toBeInstanceOf(PlaneGeometry);
        expect(clone).not.toBe(geometry);
        expect(clone.uuid).not.toBe(geometry.uuid);
        expect(clone.id).not.toBe(geometry.id);

        expect(clone.parameters).toEqual(geometry.parameters);

        let differingProp = getDifferingProp(geometry, clone);
        expect(differingProp).toBeUndefined();

        differingProp = getDifferingProp(clone, geometry);
        expect(differingProp).toBeUndefined();
      });
    });

    test('copy', () => {
      geometries.forEach((geometry) => {
        const copy = new PlaneGeometry().copy(geometry);

        expect(copy).toBeInstanceOf(PlaneGeometry);
        expect(copy).not.toBe(geometry);
        expect(copy.uuid).not.toBe(geometry.uuid);
        expect(copy.id).not.toBe(geometry.id);

        expect(copy.parameters).toEqual(geometry.parameters);

        let differingProp = getDifferingProp(geometry, copy);
        expect(differingProp).toBeUndefined();

        differingProp = getDifferingProp(copy, geometry);
        expect(differingProp).toBeUndefined();
      });
    });

    test('toJSON', () => {
      geometries.forEach((geometry) => {
        const json = geometry.toJSON();

        expect(json).not.toBeInstanceOf(PlaneGeometry);
        expect(json).not.toBeInstanceOf(BufferGeometry);
        expect(json.type).toBe('PlaneGeometry');
        expect(json.uuid).toBe(geometry.uuid);
        expect(json.id).toBeUndefined();

        const params = geometry.parameters;
        if (!params) {
          return;
        }

        // All parameters from geometry should be persisted.
        const keys = Object.keys(params);
        for (let i = 0, l = keys.length; i < l; i++) {
          const key = keys[i];
          expect(params[key]).toBe(json[key]);
        }
      });
    });

    test.todo('fromJSON', () => {
      // implement
    });
  });
});

// Compare two geometries.
function getDifferingProp(geometryA, geometryB) {
  const geometryKeys = Object.keys(geometryA);
  const cloneKeys = Object.keys(geometryB);

  let differingProp = undefined;

  for (let i = 0, l = geometryKeys.length; i < l; i++) {
    const key = geometryKeys[i];

    if (cloneKeys.indexOf(key) < 0) {
      differingProp = key;
      break;
    }
  }

  return differingProp;
}
