import { describe, expect, it, test, vi } from 'vitest';

import { toHalfFloat, fromHalfFloat } from '../src/BufferAttributeUtils.js';

describe('Buffers', () => {
  describe('BufferAttributeUtils', () => {
    test('toHalfFloat', () => {
      expect(toHalfFloat(0) === 0).toBeTruthy();

      // out of range
      expect(toHalfFloat(100000)).toBe(31743);
      expect(toHalfFloat(-100000)).toBe(64511);
      expect('out of range').toHaveBeenWarnedTimes(2);

      expect(toHalfFloat(65504)).toBe(31743);
      expect(toHalfFloat(-65504)).toBe(64511);
      expect(toHalfFloat(Math.PI)).toBe(16968);
      expect(toHalfFloat(-Math.PI)).toBe(49736);
    });

    test('fromHalfFloat', () => {
      expect(fromHalfFloat(0)).toBe(0);
      expect(fromHalfFloat(31744)).toBe(Infinity);
      expect(fromHalfFloat(64512)).toBe(-Infinity);
      expect(fromHalfFloat(31743)).toBe(65504);
      expect(fromHalfFloat(64511)).toBe(-65504);
      expect(fromHalfFloat(16968)).toBe(3.140625);
      expect(fromHalfFloat(49736)).toBe(-3.140625);
    });
  });
});
