// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';
import { resolveAfter, flushPromises } from './test-helpers.js';

import { Loader } from '../src/Loader.js';
import { ImageLoader } from '../src/ImageLoader.js';

describe('Loaders', () => {
  describe('ImageLoader', () => {
    // will be intercepted by msw, not a real url
    const _LogoTestFile = 'http://renderlayer.org/test/png/rl-logo-128.png';
    const _MissingTestFile = 'http://renderlayer.org/test/png/missing.png';

    test('constructor', () => {
      const object = new ImageLoader();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new ImageLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test('load - partial', async () => {
      const onLoad = vi.fn();
      const onProgress = vi.fn(); // unused
      const onError = vi.fn();

      const object = new ImageLoader();

      // will not make a network request in mocked environment
      const imgEl = object.load(_LogoTestFile, onLoad, onProgress, onError);
      expect(imgEl).toBeInstanceOf(HTMLElement); // element provided immediately
    });

    test.todo('load - full', async () => {
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

      const object = new ImageLoader();

      // --------------------
      // good file
      const imgEl = object.load(_LogoTestFile, onLoad, onProgress, onError);
      expect(imgEl).toBeInstanceOf(HTMLElement); // element provided immediately

      // allow time for fetch and async code to compete before asserts
      await resolveAfter(100);
      expect(onLoad).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();

      vi.clearAllMocks();

      // --------------------
      // bad file
      const missingEl = object.load(_MissingTestFile, onLoad, onProgress, onError);
      expect(missingEl).toBeInstanceOf(HTMLElement); // element provided immediately

      // allow time for fetch and async code to compete before asserts
      await resolveAfter(300);
      expect(onLoad).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
      expect('missing test file').toHaveBeenWarned();
    });
  });
});
