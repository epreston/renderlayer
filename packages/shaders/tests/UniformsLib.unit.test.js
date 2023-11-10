import { describe, expect, it, test, vi } from 'vitest';

import { UniformsLib } from '../src/UniformsLib.js';

describe('Shaders', () => {
  describe('UniformsLib', () => {
    test('constructor', () => {
      expect(UniformsLib, 'UniformsLib is defined.').toBeTruthy();
    });
  });
});
