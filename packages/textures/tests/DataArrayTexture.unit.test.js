import { describe, expect, it, test, vi } from 'vitest';

import { ClampToEdgeWrapping, NearestFilter } from '@renderlayer/shared';

import { Texture } from '../src/Texture.js';
import { DataArrayTexture } from '../src/DataArrayTexture.js';

describe('Textures', () => {
  describe('DataArrayTexture', () => {
    test('constructor', () => {
      const object = new DataArrayTexture();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new DataArrayTexture();
      expect(object).toBeInstanceOf(Texture);
    });

    test('isDataArrayTexture', () => {
      const object = new DataArrayTexture();
      expect(object.isDataArrayTexture).toBeTruthy();
    });

    test('image', () => {
      const object = new DataArrayTexture();

      const data = object.image;
      expect(data).not.toBeNull();

      const newData = { data: 'test', width: 4, height: 4, depth: 1 };
      object.image = newData;
      expect(object.image).toBe(newData);
    });

    test('magFilter', () => {
      const object = new DataArrayTexture();
      expect(object.magFilter).toBe(NearestFilter);
    });

    test('minFilter', () => {
      const object = new DataArrayTexture();
      expect(object.minFilter).toBe(NearestFilter);
    });

    test('wrapR', () => {
      const object = new DataArrayTexture();
      expect(object.wrapR).toBe(ClampToEdgeWrapping);
    });

    test('generateMipmaps', () => {
      const object = new DataArrayTexture();
      expect(object.generateMipmaps).toBe(false);
    });

    test('flipY', () => {
      const object = new DataArrayTexture();
      expect(object.flipY).toBe(false);
    });

    test('unpackAlignment', () => {
      const object = new DataArrayTexture();
      expect(object.unpackAlignment).toBe(1);
    });
  });
});
