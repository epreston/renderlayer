import { describe, expect, it, test, vi } from 'vitest';

import { Curve } from '../../src/core/Curve.js';

describe('Curves', () => {
  describe('Core', () => {
    describe('Curve', () => {
      test('constructor', () => {
        const object = new Curve();
        expect(object).toBeDefined();
      });

      test('type', () => {
        const object = new Curve();
        expect(object.type).toBe('Curve');
      });

      test.todo('arcLengthDivisions', () => {
        // implement
      });

      test.todo('getPoint', () => {
        // implement
      });

      test.todo('getPointAt', () => {
        // implement
      });

      test.todo('getPoints', () => {
        // implement
      });

      test.todo('getSpacedPoints', () => {
        // implement
      });

      test.todo('getLength', () => {
        // implement
      });

      test.todo('getLengths', () => {
        // implement
      });

      test.todo('updateArcLengths', () => {
        // implement
      });

      test.todo('getUtoTmapping', () => {
        // implement
      });

      test.todo('getTangent', () => {
        // implement
      });

      test.todo('getTangentAt', () => {
        // implement
      });

      test.todo('computeFrenetFrames', () => {
        // implement
      });

      test('clone', () => {
        const object = new Curve();
        const clonedObject = object.clone();

        expect(clonedObject).not.toBe(object);
        expect(clonedObject).toStrictEqual(object);
      });

      test.todo('copy', () => {
        // implement
      });

      test('toJSON', () => {
        const object = new Curve();
        expect(object).toMatchInlineSnapshot(`
          {
            "arcLengthDivisions": 200,
            "metadata": {
              "generator": "Curve.toJSON",
              "type": "Curve",
              "version": 4.5,
            },
            "type": "Curve",
          }
        `);
      });

      test('fromJSON', () => {
        const object = new Curve();
        const objectFromJson = new Curve().fromJSON({
          arcLengthDivisions: 200,
          metadata: {
            generator: 'Curve.toJSON',
            type: 'Curve',
            version: 4.5
          },
          type: 'Curve'
        });

        expect(objectFromJson).not.toBe(object);
        expect(objectFromJson).toStrictEqual(object);
      });
    });
  });
});
