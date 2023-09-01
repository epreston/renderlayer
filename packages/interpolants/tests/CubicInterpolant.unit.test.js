import { describe, expect, it, test, vi } from 'vitest';

import { Interpolant } from '../src/Interpolant.js';
import { CubicInterpolant } from '../src/CubicInterpolant.js';

function createCubicInterpolant() {
  const positions = new Float32Array([1, 11, 2, 22, 3, 33]);
  const values = new Float32Array([1, 11, 2, 22, 3, 33]);
  const size = 1;
  const result = new Float32Array(1);

  return new CubicInterpolant(positions, values, size, result);
}

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

    test('intervalChanged_', () => {
      const object = createCubicInterpolant();
      const evalResult = object.evaluate(0.5);
      expect(evalResult.length).toBe(1);
      expect(evalResult[0]).toBe(1);

      object.intervalChanged_(1, 11, 22);

      expect(object._weightPrev).toBe(-0.5);
      expect(object._weightNext).toBe(-0.275);
      expect(object._offsetPrev).toBe(1);
      expect(object._offsetNext).toBe(2);
    });

    test('interpolate_', () => {
      const object = createCubicInterpolant();
      const evalResult = object.evaluate(0.5);
      expect(evalResult.length).toBe(1);
      expect(evalResult[0]).toBe(1);

      const result = object.interpolate_(4, 3, 2, 1);

      expect(result.length).toBe(1);
      expect(result[0]).toBe(12.5);
    });
  });
});
