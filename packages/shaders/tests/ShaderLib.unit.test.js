import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { ShaderLib } from '../src/ShaderLib.js';

describe('Shaders', () => {
  describe('ShaderLib', () => {
    test('Instancing', () => {
      expect(ShaderLib, 'ShaderLib is defined.').toBeTruthy();
    });
  });
});
