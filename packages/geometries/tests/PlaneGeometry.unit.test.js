import { beforeEach, describe, expect, it, test, vi } from 'vitest';

import { BufferGeometry } from '@renderlayer/buffers';
import { getDifferingProp } from './prop-compare.js';

import { PlaneGeometry } from '../src/PlaneGeometry.js';

describe('Geometries', () => {
  describe('PlaneGeometry', () => {
    let _geometries = undefined;

    beforeEach(() => {
      const parameters = {
        width: 10,
        height: 30,
        widthSegments: 3,
        heightSegments: 5
      };

      _geometries = [
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

    test('constructor', () => {
      const object = new PlaneGeometry();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new PlaneGeometry();
      expect(object).toBeInstanceOf(BufferGeometry);
    });

    test('type', () => {
      const object = new PlaneGeometry();
      expect(object.type).toBe('PlaneGeometry');
    });

    test.todo('parameters', () => {
      // implement
    });

    test('clone', () => {
      _geometries.forEach((geometry) => {
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
      _geometries.forEach((geometry) => {
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
      _geometries.forEach((geometry) => {
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

    test('fromJSON', () => {
      const geoFromJson = PlaneGeometry.fromJSON({
        height: 30,
        heightSegments: 5,
        metadata: {
          generator: 'BufferGeometry.toJSON',
          type: 'BufferGeometry',
          version: 4.5
        },
        type: 'PlaneGeometry',
        uuid: 'a2a29151-ed0e-4440-99b2-fd7d56741a16',
        width: 10,
        widthSegments: 3
      });

      // will be different
      geoFromJson.uuid = _geometries[4].uuid;

      expect(geoFromJson).not.toBe(_geometries[4]);
      expect(geoFromJson).toStrictEqual(_geometries[4]);
    });
  });
});
