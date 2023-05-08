import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Texture } from '../src/Texture.js';
import { CubeTexture } from '../src/CubeTexture.js';

describe('Textures', () => {
  describe('CubeTexture', () => {
    test('Instancing', () => {
      const object = new CubeTexture();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new CubeTexture();
      expect(object).toBeInstanceOf(Texture);
    });

    test.todo('images', () => {
      // implement
    });

    test.todo('flipY', () => {
      // implement
    });

    test('isCubeTexture', () => {
      const object = new CubeTexture();
      expect(object.isCubeTexture).toBeTruthy();
    });
  });
});
