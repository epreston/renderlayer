import { describe, expect, it, test, vi } from 'vitest';

import { DRACOWorker } from '../src/DRACOWorker.js';

describe('DRACO', () => {
  describe('DRACOWorker', () => {
    test('definition', () => {
      expect(DRACOWorker).toBeDefined();
    });
  });
});
