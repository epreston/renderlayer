import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Loader } from '../src/Loader.js';
import { ImageBitmapLoader } from '../src/ImageBitmapLoader.js';

describe('Loaders', () => {
  describe('ImageBitmapLoader', () => {
    test('Instancing', () => {
      const object = new ImageBitmapLoader();
      expect('createImageBitmap() not supported.').toHaveBeenWarned();

      expect(object).toBeDefined();
    });

    test('Extending', () => {

      const object = new ImageBitmapLoader();
      expect('createImageBitmap() not supported.').toHaveBeenWarned();

      expect(object).toBeInstanceOf(Loader);
    });

    test('options', () => {
      const actual = new ImageBitmapLoader().options;
      expect('createImageBitmap() not supported.').toHaveBeenWarned();

      const expected = { premultiplyAlpha: 'none' };
      expect(actual).toEqual(expected);
    });

    test('isImageBitmapLoader', () => {
      const object = new ImageBitmapLoader();
      expect('createImageBitmap() not supported.').toHaveBeenWarned();

      expect(object.isImageBitmapLoader).toBeTruthy();
    });

    test.todo('setOptions', () => {
      // setOptions( options )
      // implement
    });

    test.todo('load', () => {
      // load( url, onLoad, onProgress, onError )
      // implement
    });
  });
});
