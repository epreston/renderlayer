import { describe, expect, it, test, vi } from 'vitest';

import { Interpolant } from '../src/Interpolant.js';

describe('Interpolants', () => {
  describe('Interpolant', () => {
    class Mock extends Interpolant {
      // Call capturing facility
      static calls = null;

      constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
        super(parameterPositions, sampleValues, sampleSize, resultBuffer);
      }

      intervalChanged_(i1, t0, t1) {
        if (Mock.calls !== null) {
          // prettier-ignore
          Mock.calls.push( {
					func: 'intervalChanged',
					args: [ i1, t0, t1 ]
				} );
        }
      }

      interpolate_(i1, t0, t, t1) {
        if (Mock.calls !== null) {
          // prettier-ignore
          Mock.calls.push( {
					func: 'interpolate',
					args: [ i1, t0, t, t1 ]
				} );
        }

        return this.copySampleValue_(i1 - 1);
      }
    }

    // Tests

    test('constructor', () => {
      const interpolant = new Mock(null, [1, 11, 2, 22, 3, 33], 2, []);

      expect(interpolant).toBeInstanceOf(Interpolant);
    });

    test('parameterPositions', () => {
      const positions = [11, 22, 33, 44, 55, 66, 77, 88, 99];
      const interpolant = new Mock(positions, null, 0, null);

      expect(interpolant.parameterPositions).toEqual(positions);
    });

    test('resultBuffer', () => {
      const values = [1, 11, 2, 22, 3, 33];
      const results = [];
      const interpolant = new Mock(null, values, 2, results);

      expect(interpolant.resultBuffer).toEqual(results);
    });

    test.todo('sampleValues', () => {
      // implement
    });

    test.todo('valueSize', () => {
      // implement
    });

    test.todo('settings', () => {
      // implement
    });

    test.todo('evaluate', () => {
      // implement
    });

    test('copySampleValue_', () => {
      const interpolant = new Mock(null, [1, 11, 2, 22, 3, 33], 2, []);

      expect(interpolant.copySampleValue_(0)).toEqual([1, 11]);
      expect(interpolant.copySampleValue_(1)).toEqual([2, 22]);
      expect(interpolant.copySampleValue_(2)).toEqual([3, 33]);
    });

    test('evaluate -> intervalChanged_ / interpolate_', () => {
      let actual, expected;

      const interpolant = new Mock([11, 22, 33, 44, 55, 66, 77, 88, 99], null, 0, null);

      Mock.calls = [];
      interpolant.evaluate(11);

      actual = Mock.calls[0];
      expected = {
        func: 'intervalChanged',
        args: [1, 11, 22]
      };
      expect(actual).toEqual(expected);

      actual = Mock.calls[1];
      expected = {
        func: 'interpolate',
        args: [1, 11, 11, 22]
      };
      expect(actual).toEqual(expected);
      expect(Mock.calls.length).toBe(2);

      Mock.calls = [];
      interpolant.evaluate(12); // same interval

      actual = Mock.calls[0];
      expected = {
        func: 'interpolate',
        args: [1, 11, 12, 22]
      };
      expect(actual).toEqual(expected);
      expect(Mock.calls.length).toBe(1);

      Mock.calls = [];
      interpolant.evaluate(22); // step forward

      actual = Mock.calls[0];
      expected = {
        func: 'intervalChanged',
        args: [2, 22, 33]
      };
      expect(actual).toEqual(expected);

      actual = Mock.calls[1];
      expected = {
        func: 'interpolate',
        args: [2, 22, 22, 33]
      };
      expect(actual).toEqual(expected);
      expect(Mock.calls.length).toBe(2);

      Mock.calls = [];
      interpolant.evaluate(21); // step back

      actual = Mock.calls[0];
      expected = {
        func: 'intervalChanged',
        args: [1, 11, 22]
      };
      expect(actual).toEqual(expected);

      actual = Mock.calls[1];
      expected = {
        func: 'interpolate',
        args: [1, 11, 21, 22]
      };
      expect(actual).toEqual(expected);
      expect(Mock.calls.length).toBe(2);

      Mock.calls = [];
      interpolant.evaluate(20); // same interval

      actual = Mock.calls[0];
      expected = {
        func: 'interpolate',
        args: [1, 11, 20, 22]
      };
      expect(actual).toEqual(expected);
      expect(Mock.calls.length).toBe(1);

      Mock.calls = [];
      interpolant.evaluate(43); // two steps forward

      actual = Mock.calls[0];
      expected = {
        func: 'intervalChanged',
        args: [3, 33, 44]
      };
      expect(actual).toEqual(expected);

      actual = Mock.calls[1];
      expected = {
        func: 'interpolate',
        args: [3, 33, 43, 44]
      };
      expect(actual).toEqual(expected);
      expect(Mock.calls.length).toBe(2);

      Mock.calls = [];
      interpolant.evaluate(12); // two steps back

      actual = Mock.calls[0];
      expected = {
        func: 'intervalChanged',
        args: [1, 11, 22]
      };
      expect(actual).toEqual(expected);

      actual = Mock.calls[1];
      expected = {
        func: 'interpolate',
        args: [1, 11, 12, 22]
      };
      expect(actual).toEqual(expected);
      expect(Mock.calls.length).toBe(2);

      Mock.calls = [];
      interpolant.evaluate(77); // random access

      actual = Mock.calls[0];
      expected = {
        func: 'intervalChanged',
        args: [7, 77, 88]
      };
      expect(actual).toEqual(expected);

      actual = Mock.calls[1];
      expected = {
        func: 'interpolate',
        args: [7, 77, 77, 88]
      };
      expect(actual).toEqual(expected);
      expect(Mock.calls.length).toBe(2);

      Mock.calls = [];
      interpolant.evaluate(80); // same interval

      actual = Mock.calls[0];
      expected = {
        func: 'interpolate',
        args: [7, 77, 80, 88]
      };
      expect(actual).toEqual(expected);
      expect(Mock.calls.length).toBe(1);

      Mock.calls = [];
      interpolant.evaluate(36); // random access

      actual = Mock.calls[0];
      expected = {
        func: 'intervalChanged',
        args: [3, 33, 44]
      };
      expect(actual).toEqual(expected);

      actual = Mock.calls[1];
      expected = {
        func: 'interpolate',
        args: [3, 33, 36, 44]
      };
      expect(actual).toEqual(expected);
      expect(Mock.calls.length).toBe(2);

      Mock.calls = [];
      interpolant.evaluate(24); // fast reset / loop (2nd)

      actual = Mock.calls[0];
      expected = {
        func: 'intervalChanged',
        args: [2, 22, 33]
      };
      expect(actual).toEqual(expected);

      actual = Mock.calls[1];
      expected = {
        func: 'interpolate',
        args: [2, 22, 24, 33]
      };
      expect(actual).toEqual(expected);
      expect(Mock.calls.length).toBe(2);

      Mock.calls = [];
      interpolant.evaluate(16); // fast reset / loop (2nd)

      actual = Mock.calls[0];
      expected = {
        func: 'intervalChanged',
        args: [1, 11, 22]
      };
      expect(actual).toEqual(expected);

      actual = Mock.calls[1];
      expected = {
        func: 'interpolate',
        args: [1, 11, 16, 22]
      };
      expect(actual).toEqual(expected);
      expect(Mock.calls.length).toBe(2);
    });
  });
});
