import { describe, expect, it, test, vi } from 'vitest';

import { ClampToEdgeWrapping } from '@renderlayer/shared';

import { CompressedTexture } from '../src/CompressedTexture.js';
import { CompressedArrayTexture } from '../src/CompressedArrayTexture.js';

describe('Textures', () => {
  describe('CompressedArrayTexture', () => {
    test('constructor', () => {
      const object = new CompressedArrayTexture();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new CompressedArrayTexture();
      expect(object).toBeInstanceOf(CompressedTexture);
    });

    test('isCompressedArrayTexture', () => {
      const object = new CompressedArrayTexture();
      expect(object.isCompressedArrayTexture).toBeTruthy();
    });

    test('wrapR', () => {
      const object = new CompressedArrayTexture();
      expect(object.wrapR).toBe(ClampToEdgeWrapping);
    });

    test('image.depth', () => {
      const object = new CompressedArrayTexture(1, 1, 1, 3);
      expect(object.image.depth).toBe(3);
    });
  });
});
