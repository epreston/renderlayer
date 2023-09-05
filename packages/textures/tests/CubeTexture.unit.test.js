import { describe, expect, it, test, vi } from 'vitest';

import { CubeReflectionMapping } from '@renderlayer/shared';

import { Texture } from '../src/Texture.js';
import { CubeTexture } from '../src/CubeTexture.js';

describe('Textures', () => {
  describe('CubeTexture', () => {
    test('constructor', () => {
      const object = new CubeTexture();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new CubeTexture();
      expect(object).toBeInstanceOf(Texture);
    });

    test('isCubeTexture', () => {
      const object = new CubeTexture();
      expect(object.isCubeTexture).toBeTruthy();
    });

    test('images', () => {
      const object = new CubeTexture();

      expect(object.images).toBeDefined();
      expect(object.images).toBeInstanceOf(Array);
    });

    test('mapping', () => {
      const object = new CubeTexture();
      expect(object.mapping).toBe(CubeReflectionMapping);
    });

    test('flipY', () => {
      const object = new CubeTexture();
      expect(object.flipY).toBe(false);
    });
  });
});
