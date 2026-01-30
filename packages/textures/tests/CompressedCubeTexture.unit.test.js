import { describe, expect, it, test, vi } from 'vitest';

import { CubeReflectionMapping, RGBAFormat, UnsignedByteType } from '@renderlayer/shared';

import { CompressedTexture } from '../src/CompressedTexture.js';
import { CompressedCubeTexture } from '../src/CompressedCubeTexture.js';

describe('Textures', () => {
  describe('CompressedCubeTexture', () => {
    const _images = [
      {
        height: 6,
        width: 7
      }
    ];

    test('constructor', () => {
      const object = new CompressedCubeTexture(_images, RGBAFormat, UnsignedByteType);
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new CompressedCubeTexture(_images, RGBAFormat, UnsignedByteType);
      expect(object).toBeInstanceOf(CompressedTexture);
    });

    test('isCompressedCubeTexture', () => {
      const object = new CompressedCubeTexture(_images, RGBAFormat, UnsignedByteType);
      expect(object.isCompressedCubeTexture).toBeTruthy();
    });

    test('isCubeTexture', () => {
      const object = new CompressedCubeTexture(_images, RGBAFormat, UnsignedByteType);
      expect(object.isCubeTexture).toBeTruthy();
    });

    test('mapping', () => {
      const object = new CompressedCubeTexture(_images, RGBAFormat, UnsignedByteType);
      expect(object.mapping).toBe(CubeReflectionMapping);
    });
  });
});
