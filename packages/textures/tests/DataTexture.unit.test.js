import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Texture } from '../src/Texture.js';
import { DataTexture } from '../src/DataTexture.js';

describe('Textures', () => {
  describe('DataTexture', () => {
    test('constructor', () => {
      const object = new DataTexture();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new DataTexture();
      expect(object).toBeInstanceOf(Texture);
    });

    test.todo('image', () => {
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

    test('isDataTexture', () => {
      const object = new DataTexture();
      expect(object.isDataTexture).toBeTruthy();
    });
  });
});
