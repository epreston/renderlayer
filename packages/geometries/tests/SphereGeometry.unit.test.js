import { beforeEach, describe, expect, it, test, vi } from 'vitest';

import { BufferGeometry } from '@renderlayer/buffers';
import { getDifferingProp } from './prop-compare.js';

import { SphereGeometry } from '../src/SphereGeometry.js';

describe('Geometries', () => {
  describe('SphereGeometry', () => {
    /** @type {SphereGeometry[]} */
    let _geometries = undefined;

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

      _geometries = [
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

    test('parameters', () => {
      const object = new SphereGeometry();
      expect(object.parameters).toBeDefined();
    });

    test('clone', () => {
      _geometries.forEach((geometry) => {
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
      _geometries.forEach((geometry) => {
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
      _geometries.forEach((geometry) => {
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

    test('fromJSON', () => {
      const geoFromJson = SphereGeometry.fromJSON({
        heightSegments: 30,
        metadata: {
          generator: 'BufferGeometry.toJSON',
          type: 'BufferGeometry',
          version: 4.5
        },
        phiLength: 1,
        phiStart: 0.5,
        radius: 10,
        thetaLength: 2,
        thetaStart: 0.4,
        type: 'SphereGeometry',
        uuid: '4a9a9495-8f45-401c-8103-b3094be35bb3',
        widthSegments: 20
      });

      // will be different
      geoFromJson.uuid = _geometries[7].uuid;

      expect(geoFromJson).not.toBe(_geometries[7]);
      expect(geoFromJson).toStrictEqual(_geometries[7]);
    });
  });
});
