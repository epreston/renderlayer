// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';
import { resolveAfter, flushPromises } from './test-helpers.js';

import { Loader } from '../src/Loader.js';
import { ImageBitmapLoader } from '../src/ImageBitmapLoader.js';

// will be intercepted by msw, not a real url
const DataTestFile = 'http://renderlayer.org/test/png/rl-logo-128.png';
const MissingTestFile = 'http://renderlayer.org/test/png/missing.png';

// createImageBitmap is mocked in vitest.setup.js, otherwise
// expect('createImageBitmap() not supported.').toHaveBeenWarned();

describe('Loaders', () => {
  describe('ImageBitmapLoader', () => {
    test('constructor', () => {
      const object = new ImageBitmapLoader();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new ImageBitmapLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test('options', () => {
      const actual = new ImageBitmapLoader().options;
      const expected = { premultiplyAlpha: 'none' };
      expect(actual).toEqual(expected);
    });

    test('isImageBitmapLoader', () => {
      const object = new ImageBitmapLoader();
      expect(object.isImageBitmapLoader).toBeTruthy();
    });

    test('setOptions', () => {
      const object = new ImageBitmapLoader();

      expect(object.options).toMatchInlineSnapshot(`
        {
          "premultiplyAlpha": "none",
        }
      `);

      object.setOptions({ imageOrientation: 'flipY' });

      expect(object.options).toMatchInlineSnapshot(`
        {
          "imageOrientation": "flipY",
        }
      `);
    });

    test('load', async () => {
      const onLoad = vi.fn();
      const onProgress = vi.fn(); // unused
      const onError = vi.fn();

      const object = new ImageBitmapLoader();

      // --------------------
      // good file
      object.load(DataTestFile, onLoad, onProgress, onError);

      // allow time for fetch and async code to compete before asserts
      // await resolveAfter(100);
      await flushPromises();
      expect(onLoad).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();

      vi.clearAllMocks();

      // --------------------
      // bad file
      object.load(MissingTestFile, onLoad, onProgress, onError);

      // allow time for fetch and async code to compete before asserts
      // await resolveAfter(100);
      await flushPromises();
      expect(onLoad).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
      expect('missing test file').toHaveBeenWarned();
    });
  });
});
