import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { ShaderChunk } from '../src/ShaderChunk.js';

describe('Shaders', () => {
  describe('ShaderChunk', () => {
    test('Instancing', () => {
      expect(ShaderChunk).toBeDefined();
    });
  });
});
