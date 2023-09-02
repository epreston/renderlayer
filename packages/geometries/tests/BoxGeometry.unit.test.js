import { beforeEach, describe, expect, it, test, vi } from 'vitest';

import { BufferGeometry } from '@renderlayer/buffers';
import { getDifferingProp } from './prop-compare.js';

import { BoxGeometry } from '../src/BoxGeometry.js';

describe('Geometries', () => {
  describe('BoxGeometry', () => {
    let geometries = undefined;

    beforeEach(function () {
      const parameters = {
        width: 10,
        height: 20,
        depth: 30,
        widthSegments: 2,
        heightSegments: 3,
        depthSegments: 4
      };

      geometries = [
        new BoxGeometry(),
        new BoxGeometry(parameters.width, parameters.height, parameters.depth),
        new BoxGeometry(
          parameters.width,
          parameters.height,
          parameters.depth,
          parameters.widthSegments,
          parameters.heightSegments,
          parameters.depthSegments
        )
      ];
    });

    test('constructor', () => {
      const object = new BoxGeometry();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new BoxGeometry();
      expect(object).toBeInstanceOf(BufferGeometry);
    });

    test('type', () => {
      const object = new BoxGeometry();
      expect(object.type).toBe('BoxGeometry');
    });

    test.todo('parameters', () => {
      // implement
    });

    test('clone', () => {
      geometries.forEach((geometry) => {
        const clone = geometry.clone();

        expect(clone).toBeInstanceOf(BoxGeometry);
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
        const copy = new BoxGeometry().copy(geometry);

        expect(copy).toBeInstanceOf(BoxGeometry);
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

        expect(json).not.toBeInstanceOf(BoxGeometry);
        expect(json).not.toBeInstanceOf(BufferGeometry);
        expect(json.type).toBe('BoxGeometry');
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
      const geoFromJson = BoxGeometry.fromJSON({
        depth: 30,
        depthSegments: 4,
        height: 20,
        heightSegments: 3,
        metadata: {
          generator: 'BufferGeometry.toJSON',
          type: 'BufferGeometry',
          version: 4.5
        },
        type: 'BoxGeometry',
        uuid: 'c70610e7-3112-40ec-99a4-a627bb9ad895',
        width: 10,
        widthSegments: 2
      });

      // will be different
      geoFromJson.uuid = geometries[2].uuid;

      expect(geoFromJson).not.toBe(geometries[2]);
      expect(geoFromJson).toStrictEqual(geometries[2]);
    });
  });
});
