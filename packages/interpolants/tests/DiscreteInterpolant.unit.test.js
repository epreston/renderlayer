import { describe, expect, it, test, vi } from 'vitest';

import { Interpolant } from '../src/Interpolant.js';
import { DiscreteInterpolant } from '../src/DiscreteInterpolant.js';

describe('Interpolants', () => {
  describe('DiscreteInterpolant', () => {
    test('extends', () => {
      const object = new DiscreteInterpolant(null, [1, 11, 2, 22, 3, 33], 2, []);
      expect(object).toBeInstanceOf(Interpolant);
    });

    test('constructor', () => {
      // parameterPositions, sampleValues, sampleSize, resultBuffer
      const object = new DiscreteInterpolant(null, [1, 11, 2, 22, 3, 33], 2, []);
      expect(object).toBeDefined();
    });

    test.todo('interpolate_', () => {
      // private
      // interpolate_( i1 /*, t0, t, t1 */ )
      // return equal to base class Interpolant.resultBuffer after call
      // implement
    });
  });
});
