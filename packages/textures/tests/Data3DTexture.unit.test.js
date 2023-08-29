import { describe, expect, it, test, vi } from 'vitest';

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

    test.todo('image', () => {
      // implement
    });

    test.todo('magFilter', () => {
      // implement
    });

    test.todo('minFilter', () => {
      // implement
    });

    test.todo('wrapR', () => {
      // implement
    });

    test.todo('generateMipmaps', () => {
      // implement
    });

    test.todo('flipY', () => {
      // implement
    });

    test.todo('unpackAlignment', () => {
      // implement
    });
  });
});
