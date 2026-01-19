import { describe, expect, it, test, vi } from 'vitest';

import { Interpolant } from '../src/Interpolant.js';
import { QuaternionLinearInterpolant } from '../src/QuaternionLinearInterpolant.js';

describe('Interpolants', () => {
  describe('QuaternionLinearInterpolant', () => {
    function _createQuaternionLinearInterpolant() {
      const positions = new Float32Array([1, 11, 2, 22, 3, 33, 4, 44]);
      const values = new Float32Array([1, 11, 2, 22, 3, 33, 4, 44]);
      const size = 1;
      const result = new Float32Array(1);

      return new QuaternionLinearInterpolant(positions, values, size, result);
    }

    test('constructor', () => {
      // parameterPositions, sampleValues, sampleSize, resultBuffer
      const object = new QuaternionLinearInterpolant(null, [1, 11, 2, 22, 3, 33], 2, []);
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new QuaternionLinearInterpolant(null, [1, 11, 2, 22, 3, 33], 2, []);
      expect(object).toBeInstanceOf(Interpolant);
    });

    test('evaluate', () => {
      const object = _createQuaternionLinearInterpolant();
      const evalResult = object.evaluate(0.5);
      expect(evalResult.length).toBe(1);
      expect(evalResult[0]).toBe(1);
    });

    test.todo('interpolate_', () => {
      // private
      // interpolate_( i1, t0, t, t1 )
      // return equal to base class Interpolant.resultBuffer after call
      // implement
    });
  });
});
