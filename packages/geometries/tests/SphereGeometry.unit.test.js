import { beforeEach, describe, expect, it, test, vi } from 'vitest';

import { BufferGeometry } from '@renderlayer/buffers';
import { getDifferingProp } from './prop-compare.js';

import { SphereGeometry } from '../src/SphereGeometry.js';

describe('Geometries', () => {
  describe('SphereGeometry', () => {
    let geometries = undefined;

    beforeEach(function () {
      const parameters = {
        radius: 10,
        widthSegments: 20,
        heightSegments: 30,
        phiStart: 0.5,
        phiLength: 1.0,
        thetaStart: 0.4,
        thetaLength: 2.0
      };

      geometries = [
        new SphereGeometry(),
        new SphereGeometry(parameters.radius),
        new SphereGeometry(parameters.radius, parameters.widthSegments),
        new SphereGeometry(parameters.radius, parameters.widthSegments, parameters.heightSegments),
        new SphereGeometry(
          parameters.radius,
          parameters.widthSegments,
          parameters.heightSegments,
          parameters.phiStart
        ),
        new SphereGeometry(
          parameters.radius,
          parameters.widthSegments,
          parameters.heightSegments,
          parameters.phiStart,
          parameters.phiLength
        ),
        new SphereGeometry(
          parameters.radius,
          parameters.widthSegments,
          parameters.heightSegments,
          parameters.phiStart,
          parameters.phiLength,
          parameters.thetaStart
        ),
        new SphereGeometry(
          parameters.radius,
          parameters.widthSegments,
          parameters.heightSegments,
          parameters.phiStart,
          parameters.phiLength,
          parameters.thetaStart,
          parameters.thetaLength
        )
      ];
    });

    test('constructor', () => {
      const object = new SphereGeometry();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new SphereGeometry();
      expect(object).toBeInstanceOf(BufferGeometry);
    });

    test('type', () => {
      const object = new SphereGeometry();
      expect(object.type).toBe('SphereGeometry');
    });

    test.todo('parameters', () => {
      // implement
    });

    test('clone', () => {
      geometries.forEach((geometry) => {
        const clone = geometry.clone();

        expect(clone).toBeInstanceOf(SphereGeometry);
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
        const copy = new SphereGeometry().copy(geometry);

        expect(copy).toBeInstanceOf(SphereGeometry);
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

        expect(json).not.toBeInstanceOf(SphereGeometry);
        expect(json).not.toBeInstanceOf(BufferGeometry);
        expect(json.type).toBe('SphereGeometry');
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
