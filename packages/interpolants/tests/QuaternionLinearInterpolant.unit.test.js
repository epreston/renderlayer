import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Interpolant } from '../src/Interpolant.js';
import { QuaternionLinearInterpolant } from '../src/QuaternionLinearInterpolant.js';

describe('Interpolants', () => {
  describe('QuaternionLinearInterpolant', () => {
    test('Instancing', () => {
      // parameterPositions, sampleValues, sampleSize, resultBuffer
      const object = new QuaternionLinearInterpolant(null, [1, 11, 2, 22, 3, 33], 2, []);
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new QuaternionLinearInterpolant(null, [1, 11, 2, 22, 3, 33], 2, []);
      expect(object).toBeInstanceOf(Interpolant);
    });

    test.todo('interpolate_', () => {
      // private
      // interpolate_( i1, t0, t, t1 )
      // return equal to base class Interpolant.resultBuffer after call
      // implement
    });
  });
});
