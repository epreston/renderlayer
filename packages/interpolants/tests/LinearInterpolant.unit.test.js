import { describe, expect, it, test, vi } from 'vitest';

import { Interpolant } from '../src/Interpolant.js';
import { LinearInterpolant } from '../src/LinearInterpolant.js';

function createLinearInterpolant() {
  const positions = new Float32Array([1, 11, 2, 22, 3, 33]);
  const values = new Float32Array([1, 11, 2, 22, 3, 33]);
  const size = 1;
  const result = new Float32Array(1);

  return new LinearInterpolant(positions, values, size, result);
}

describe('Interpolants', () => {
  describe('LinearInterpolant', () => {
    test('constructor', () => {
      // parameterPositions, sampleValues, sampleSize, resultBuffer
      const object = new LinearInterpolant(null, [1, 11, 2, 22, 3, 33], 2, []);
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new LinearInterpolant(null, [1, 11, 2, 22, 3, 33], 2, []);
      expect(object).toBeInstanceOf(Interpolant);
    });

    test('interpolate_', () => {
      // private
      const object = createLinearInterpolant();
      const evalResult = object.evaluate(0.5);
      expect(evalResult.length).toBe(1);
      expect(evalResult[0]).toBe(1);

      // return equal to base class Interpolant.resultBuffer after call
      expect(evalResult).toEqual(object.resultBuffer);
    });
  });
});
