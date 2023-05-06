import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Curve } from '../../src/core/Curve.js';

describe('Curves', () => {
  describe('Core', () => {
    describe('Curve', () => {
      test('Instancing', () => {
        const object = new Curve();
        expect(object).toBeDefined();
      });

      test('type', () => {
        const object = new Curve();
        expect(object.type === 'Curve').toBeTruthy();
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

      test.todo('clone', () => {
        // implement
      });

      test.todo('copy', () => {
        // implement
      });

      test.todo('toJSON', () => {
        // implement
      });

      test.todo('fromJSON', () => {
        // implement
      });
    });
  });
});
