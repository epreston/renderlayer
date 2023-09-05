import { describe, expect, it, test, vi } from 'vitest';

import { ClampToEdgeWrapping, NearestFilter } from '@renderlayer/shared';

import { Texture } from '../src/Texture.js';
import { Data3DTexture } from '../src/Data3DTexture.js';

describe('Textures', () => {
  describe('Data3DTexture', () => {
    test('constructor', () => {
      const object = new Data3DTexture();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new Data3DTexture();
      expect(object).toBeInstanceOf(Texture);
    });

    test('isData3DTexture', () => {
      const object = new Data3DTexture();
      expect(object.isData3DTexture).toBeTruthy();
    });

    test('image', () => {
      const object = new Data3DTexture();

      const data = object.image;
      expect(data).not.toBeNull();

      const newData = { data: 'test', width: 4, height: 4, depth: 1 };
      object.image = newData;
      expect(object.image).toBe(newData);
    });

    test('magFilter', () => {
      const object = new Data3DTexture();
      expect(object.magFilter).toBe(NearestFilter);
    });

    test('minFilter', () => {
      const object = new Data3DTexture();
      expect(object.magFilter).toBe(NearestFilter);
    });

    test('wrapR', () => {
      const object = new Data3DTexture();
      expect(object.wrapR).toBe(ClampToEdgeWrapping);
    });

    test('generateMipmaps', () => {
      const object = new Data3DTexture();
      expect(object.generateMipmaps).toBe(false);
    });

    test('flipY', () => {
      const object = new Data3DTexture();
      expect(object.flipY).toBe(false);
    });

    test('unpackAlignment', () => {
      const object = new Data3DTexture();
      expect(object.unpackAlignment).toBe(1);
    });
  });
});
