import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Interpolant } from '../src/Interpolant.js';
import { CubicInterpolant } from '../src/CubicInterpolant.js';

describe('Interpolants', () => {
  describe('CubicInterpolant', () => {
    test('constructor', () => {
      // parameterPositions, sampleValues, sampleSize, resultBuffer
      const object = new CubicInterpolant(null, [1, 11, 2, 22, 3, 33], 2, []);
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new CubicInterpolant(null, [1, 11, 2, 22, 3, 33], 2, []);
      expect(object).toBeInstanceOf(Interpolant);
    });

    test.todo('intervalChanged_', () => {
      // private
      // intervalChanged_( i1, t0, t1 )
      // implement
    });

    test.todo('interpolate_', () => {
      // private
      // interpolate_( i1, t0, t, t1 )
      // return equal to base class Interpolant.resultBuffer after call
      // implement
    });
  });
});
