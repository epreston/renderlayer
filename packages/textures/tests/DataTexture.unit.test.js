import { describe, expect, it, test, vi } from 'vitest';

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

    test('isDataTexture', () => {
      const object = new DataTexture();
      expect(object.isDataTexture).toBeTruthy();
    });

    test('image', () => {
      const object = new DataTexture();

      const data = object.image;
      expect(data).not.toBeNull();

      const newData = { data: 'test', width: 4, height: 4 };
      object.image = newData;
      expect(object.image).toBe(newData);
    });

    test('generateMipmaps', () => {
      const object = new DataTexture();
      expect(object.generateMipmaps).toBe(false);
    });

    test('flipY', () => {
      const object = new DataTexture();
      expect(object.flipY).toBe(false);
    });

    test('unpackAlignment', () => {
      const object = new DataTexture();
      expect(object.unpackAlignment).toBe(1);
    });
  });
});
