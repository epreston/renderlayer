import { describe, expect, it, test, vi } from 'vitest';

import { getDFGLUT } from '../src/DFGLUTData.js';

describe('Shared', () => {
  describe('DFGLUTData', () => {
    test('constructor', () => {
      expect(getDFGLUT).toBeDefined();
    });
  });
});
