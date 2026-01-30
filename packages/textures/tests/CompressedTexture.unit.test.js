import { describe, expect, it, test, vi } from 'vitest';

import { Texture } from '../src/Texture.js';
import { CompressedTexture } from '../src/CompressedTexture.js';

describe('Textures', () => {
  describe('CompressedTexture', () => {
    test('constructor', () => {
      const object = new CompressedTexture();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new CompressedTexture();
      expect(object).toBeInstanceOf(Texture);
    });

    test('isCompressedTexture', () => {
      const object = new CompressedTexture();
      expect(object.isCompressedTexture).toBeTruthy();
    });

    test('flipY', () => {
      const object = new CompressedTexture();
      expect(object.flipY).toBeFalsy();
    });

    test('generateMipmaps', () => {
      const object = new CompressedTexture(1, 1, 1, 3);
      expect(object.generateMipmaps).toBeFalsy();
    });
  });
});
