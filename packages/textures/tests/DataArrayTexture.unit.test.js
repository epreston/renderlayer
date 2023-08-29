import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

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

    test('isDataArrayTexture', () => {
      const object = new DataArrayTexture();
      expect(object.isDataArrayTexture).toBeTruthy();
    });
  });
});
