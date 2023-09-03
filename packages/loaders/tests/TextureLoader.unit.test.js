// Replace -AT- to enable: -AT-vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';
import { resolveAfter, flushPromises } from './test-helpers.js';

import { Texture } from '@renderlayer/textures';

import { Loader } from '../src/Loader.js';
import { TextureLoader } from '../src/TextureLoader.js';

// will be intercepted by msw, not a real url
const UVTestFile = 'http://renderlayer.org/test/jpeg/uvcheck.jpg';
const MissingTestFile = 'http://renderlayer.org/test/jpeg/missing.jpg';

describe('Loaders', () => {
  describe('TextureLoader', () => {
    test('constructor', () => {
      const object = new TextureLoader();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new TextureLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test.todo('load', async () => {
      /**
       * The following code will work when running this test in a jsdom
       * context (see comment at top of file), provided that the "canvas"
       * package is installed and jsdom is configured to make resources
       * 'usable' with the following in the vitest.config.js file.
       *
       * environmentOptions: {
       *   jsdom: {
       *     resources: 'usable'
       *   }
       * },
       *
       * Test execution will fail when running the whole suite but will
       * succeed when the file is run in isolation. Disabling until a
       * better alternative is found.
       */

      const onLoad = vi.fn();
      const onProgress = vi.fn(); // unused
      const onError = vi.fn();

      const object = new TextureLoader();

      // --------------------
      // good file
      const texture = object.load(UVTestFile, onLoad, onProgress, onError);
      expect(texture).toBeInstanceOf(Texture); // empty provided immediately

      // allow time for fetch and async code to compete before asserts
      await resolveAfter(100);
      expect(onLoad).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();

      vi.clearAllMocks();

      // --------------------
      // bad file
      const missingTexture = object.load(MissingTestFile, onLoad, onProgress, onError);
      expect(missingTexture).toBeInstanceOf(Texture); // empty provided immediately

      // allow time for fetch and async code to compete before asserts
      await resolveAfter(100);
      expect(onLoad).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
      expect('missing test file').toHaveBeenWarned();
    });
  });
});
