import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { BufferGeometry } from '@renderlayer/buffers';
import { CylinderGeometry } from '../src/CylinderGeometry.js';

describe('Geometries', () => {
  describe('CylinderGeometry', () => {
    let geometries = undefined;

    beforeEach(() => {
      const parameters = {
        radiusTop: 10,
        radiusBottom: 20,
        height: 30,
        radialSegments: 20,
        heightSegments: 30,
        openEnded: true,
        thetaStart: 0.1,
        thetaLength: 2.0
      };

      geometries = [
        new CylinderGeometry(),
        new CylinderGeometry(parameters.radiusTop),
        new CylinderGeometry(parameters.radiusTop, parameters.radiusBottom),
        new CylinderGeometry(parameters.radiusTop, parameters.radiusBottom, parameters.height),
        new CylinderGeometry(
          parameters.radiusTop,
          parameters.radiusBottom,
          parameters.height,
          parameters.radialSegments
        ),
        new CylinderGeometry(
          parameters.radiusTop,
          parameters.radiusBottom,
          parameters.height,
          parameters.radialSegments,
          parameters.heightSegments
        ),
        new CylinderGeometry(
          parameters.radiusTop,
          parameters.radiusBottom,
          parameters.height,
          parameters.radialSegments,
          parameters.heightSegments,
          parameters.openEnded
        ),
        new CylinderGeometry(
          parameters.radiusTop,
          parameters.radiusBottom,
          parameters.height,
          parameters.radialSegments,
          parameters.heightSegments,
          parameters.openEnded,
          parameters.thetaStart
        ),
        new CylinderGeometry(
          parameters.radiusTop,
          parameters.radiusBottom,
          parameters.height,
          parameters.radialSegments,
          parameters.heightSegments,
          parameters.openEnded,
          parameters.thetaStart,
          parameters.thetaLength
        )
      ];
    });

    test('constructor', () => {
      const object = new CylinderGeometry();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new CylinderGeometry();
      expect(object).toBeInstanceOf(BufferGeometry);
    });

    test('type', () => {
      const object = new CylinderGeometry();
      expect(object.type === 'CylinderGeometry').toBeTruthy();
    });

    test.todo('parameters', () => {
      // implement
    });

    test('clone', () => {
      geometries.forEach((geometry) => {
        const clone = geometry.clone();

        expect(clone).toBeInstanceOf(CylinderGeometry);
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
        const copy = new CylinderGeometry().copy(geometry);

        expect(copy).toBeInstanceOf(CylinderGeometry);
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

        expect(json).not.toBeInstanceOf(CylinderGeometry);
        expect(json).not.toBeInstanceOf(BufferGeometry);
        expect(json.type).toBe('CylinderGeometry');
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
