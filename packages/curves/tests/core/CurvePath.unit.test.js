import { describe, expect, it, test, vi } from 'vitest';

import { Curve } from '../../src/core/Curve.js';
import { CurvePath } from '../../src/core/CurvePath.js';

describe('Curves', () => {
  describe('Core', () => {
    describe('CurvePath', () => {
      test('constructor', () => {
        const object = new CurvePath();
        expect(object).toBeDefined();
      });

      test('extends', () => {
        const object = new CurvePath();
        expect(object).toBeInstanceOf(Curve);
      });

      test('type', () => {
        const object = new CurvePath();
        expect(object.type).toBe('CurvePath');
      });

      test('curves', () => {
        const object = new CurvePath();
        expect(object.curves).toBeInstanceOf(Array);
      });

      test('autoClose', () => {
        const object = new CurvePath();
        expect(object.autoClose).toBe(false);
      });

      test.todo('add', () => {
        // implement
      });

      test.todo('closePath', () => {
        // implement
      });

      test.todo('getPoint', () => {
        // implement
      });

      test.todo('getLength', () => {
        // implement
      });

      test.todo('updateArcLengths', () => {
        // implement
      });

      test.todo('getCurveLengths', () => {
        // implement
      });

      test.todo('getSpacedPoints', () => {
        // implement
      });

      test.todo('getPoints', () => {
        // implement
      });

      test.todo('copy', () => {
        // implement
      });

      test('toJSON', () => {
        const object = new CurvePath();
        expect(object).toMatchInlineSnapshot(`
          {
            "arcLengthDivisions": 200,
            "autoClose": false,
            "curves": [],
            "metadata": {
              "generator": "Curve.toJSON",
              "type": "Curve",
              "version": 4.5,
            },
            "type": "CurvePath",
          }
        `);
      });

      test('fromJSON', () => {
        const object = new CurvePath();
        const objectFromJson = new CurvePath().fromJSON({
          arcLengthDivisions: 200,
          autoClose: false,
          curves: [],
          metadata: {
            generator: 'Curve.toJSON',
            type: 'Curve',
            version: 4.5
          },
          type: 'CurvePath'
        });

        expect(objectFromJson).not.toBe(object);
        expect(objectFromJson).toStrictEqual(object);
      });
    });
  });
});
