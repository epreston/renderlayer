import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import * as KeyframeUtils from '../src/KeyframeUtils.js';

describe('Keyframes', () => {
  describe('KeyframeUtils', () => {
    test('arraySlice', () => {
      expect(KeyframeUtils.arraySlice).toBeDefined();
    });

    test.todo('convertArray', () => {
      expect(KeyframeUtils.convertArray).toBeDefined();
    });

    test.todo('isTypedArray', () => {
      expect(KeyframeUtils.isTypedArray).toBeDefined();
    });
  });
});
