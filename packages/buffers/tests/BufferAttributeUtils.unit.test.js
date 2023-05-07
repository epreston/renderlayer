import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import * as DataUtils from '../src/BufferAttributeUtils.js';

describe('Buffers', () => {
  describe('BufferAttributeUtils', () => {
    test('toHalfFloat', () => {
      expect(DataUtils.toHalfFloat(0) === 0).toBeTruthy();

      // out of range
      expect(DataUtils.toHalfFloat(100000) === 31743).toBeTruthy();
      expect(DataUtils.toHalfFloat(-100000) === 64511).toBeTruthy();
      expect('out of range').toHaveBeenWarnedTimes(2);

      expect(DataUtils.toHalfFloat(65504) === 31743).toBeTruthy();
      expect(DataUtils.toHalfFloat(-65504) === 64511).toBeTruthy();
      expect(DataUtils.toHalfFloat(Math.PI) === 16968).toBeTruthy();
      expect(DataUtils.toHalfFloat(-Math.PI) === 49736).toBeTruthy();
    });

    test('fromHalfFloat', () => {
      expect(DataUtils.fromHalfFloat(0) === 0).toBeTruthy();
      expect(DataUtils.fromHalfFloat(31744) === Infinity).toBeTruthy();
      expect(DataUtils.fromHalfFloat(64512) === -Infinity).toBeTruthy();
      expect(DataUtils.fromHalfFloat(31743) === 65504).toBeTruthy();
      expect(DataUtils.fromHalfFloat(64511) === -65504).toBeTruthy();
      expect(DataUtils.fromHalfFloat(16968) === 3.140625).toBeTruthy();
      expect(DataUtils.fromHalfFloat(49736) === -3.140625).toBeTruthy();
    });
  });
});
