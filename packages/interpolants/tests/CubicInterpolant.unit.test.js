import { describe, expect, it, test, vi } from 'vitest';

import { Interpolant } from '../src/Interpolant.js';
import { CubicInterpolant } from '../src/CubicInterpolant.js';

function createCubicInterpolant() {
  return new CubicInterpolant(new Float32Array(2), new Float32Array(2), 1, new Float32Array(1));
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
      expect(evalResult[0]).toBe(0);

      object.intervalChanged_(1, 11, 22);

      expect(object._weightPrev).toBe(-0.5);
      expect(object._weightNext).toBe(-0.5);
      expect(object._offsetPrev).toBe(1);
      expect(object._offsetNext).toBe(0);
    });

    test('interpolate_', () => {
      const object = createCubicInterpolant();
      const evalResult = object.evaluate(0.5);
      expect(evalResult.length).toBe(1);
      expect(evalResult[0]).toBe(0);

      const result = object.interpolate_(1, 11, 11, 22);

      expect(result.length).toBe(1);
      expect(result[0]).toBe(0);
    });
  });
});
