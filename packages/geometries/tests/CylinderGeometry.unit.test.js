import { beforeEach, describe, expect, it, test, vi } from 'vitest';

import { BufferGeometry } from '@renderlayer/buffers';
import { getDifferingProp } from './prop-compare.js';

import { CylinderGeometry } from '../src/CylinderGeometry.js';

describe('Geometries', () => {
  describe('CylinderGeometry', () => {
    let _geometries = undefined;

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

      _geometries = [
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
      expect(object.type).toBe('CylinderGeometry');
    });

    test('parameters', () => {
      const object = new CylinderGeometry();
      expect(object.parameters).toBeDefined();
    });

    test('clone', () => {
      _geometries.forEach((geometry) => {
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
      _geometries.forEach((geometry) => {
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
      _geometries.forEach((geometry) => {
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

    test('fromJSON', () => {
      const geoFromJson = CylinderGeometry.fromJSON({
        height: 30,
        heightSegments: 30,
        metadata: {
          generator: 'BufferGeometry.toJSON',
          type: 'BufferGeometry',
          version: 4.5
        },
        openEnded: true,
        radialSegments: 20,
        radiusBottom: 20,
        radiusTop: 10,
        thetaLength: 2,
        thetaStart: 0.1,
        type: 'CylinderGeometry',
        uuid: '9559a72d-42b5-44d1-85f3-653e9f468ba0'
      });

      // will be different
      geoFromJson.uuid = _geometries[8].uuid;

      expect(geoFromJson).not.toBe(_geometries[8]);
      expect(geoFromJson).toStrictEqual(_geometries[8]);
    });
  });
});
