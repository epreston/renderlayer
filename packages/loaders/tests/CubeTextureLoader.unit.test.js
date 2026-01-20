// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';
import { resolveAfter, flushPromises } from './test-helpers.js';

import { CubeTexture } from '@renderlayer/textures';

import { Loader } from '../src/Loader.js';
import { CubeTextureLoader } from '../src/CubeTextureLoader.js';

describe('Loaders', () => {
  describe('CubeTextureLoader', () => {
    // will be intercepted by msw, not a real url
    const _UVTestFile = 'http://renderlayer.org/test/jpeg/uvcheck.jpg';
    const _MissingTestFile = 'http://renderlayer.org/test/jpeg/missing.jpg';

    test('constructor', () => {
      const object = new CubeTextureLoader();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new CubeTextureLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test('load - partial', async () => {
      const onLoad = vi.fn();
      const onProgress = vi.fn(); // unused
      const onError = vi.fn();

      const object = new CubeTextureLoader();

      const cubeImages = [
        _UVTestFile,
        _UVTestFile,
        _UVTestFile,
        _UVTestFile,
        _UVTestFile,
        _UVTestFile
      ];

      // will not make a network request in mock environment
      const texture = object.load(cubeImages, onLoad, onProgress, onError);
      expect(texture).toBeInstanceOf(CubeTexture); // empty provided immediately
    });

    /**
     * The following tests will work when running this test in a jsdom
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

    test.skip('load - full - good file', async () => {
      const onLoad = vi.fn();
      const onProgress = vi.fn(); // unused
      const onError = vi.fn();

      const object = new CubeTextureLoader();

      const cubeImages = [
        _UVTestFile,
        _UVTestFile,
        _UVTestFile,
        _UVTestFile,
        _UVTestFile,
        _UVTestFile
      ];

      const texture = object.load(cubeImages, onLoad, onProgress, onError);
      expect(texture).toBeInstanceOf(CubeTexture); // empty provided immediately

      // allow time for fetch and async code to compete before asserts
      await resolveAfter(100);
      expect(onLoad).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    test.skip('load - full - bad file', async () => {
      const onLoad = vi.fn();
      const onProgress = vi.fn(); // unused
      const onError = vi.fn();

      const object = new CubeTextureLoader();

      const cubeImages = [
        _MissingTestFile,
        _MissingTestFile,
        _MissingTestFile,
        _MissingTestFile,
        _MissingTestFile,
        _MissingTestFile
      ];

      const missingTexture = object.load(cubeImages, onLoad, onProgress, onError);
      expect(missingTexture).toBeInstanceOf(CubeTexture); // empty provided immediately

      // allow time for fetch and async code to compete before asserts
      await resolveAfter(100);
      expect(onLoad).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
      expect('missing test file').toHaveBeenWarned();
    });
  });
});
