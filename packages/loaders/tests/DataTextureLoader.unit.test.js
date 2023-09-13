// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';
import { resolveAfter, flushPromises } from './test-helpers.js';

import { DataTexture } from '@renderlayer/textures';

import { Loader } from '../src/Loader.js';
import { DataTextureLoader } from '../src/DataTextureLoader.js';

// will be intercepted by msw, not a real url
// const UVTestFile = 'http://renderlayer.org/test/jpeg/uvcheck.jpg';
// const MissingTestFile = 'http://renderlayer.org/test/jpeg/missing.jpg';

describe('Loaders', () => {
  describe('DataTextureLoader', () => {
    test('constructor', () => {
      const object = new DataTextureLoader();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new DataTextureLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test.todo('load - partial', async () => {
      // const onLoad = vi.fn();
      // const onProgress = vi.fn(); // unused
      // const onError = vi.fn();
      // const object = new DataTextureLoader();
      // const cubeImages = [UVTestFile, UVTestFile, UVTestFile, UVTestFile, UVTestFile, UVTestFile];
      // will not make a network request in mock environment
      // const texture = object.load(cubeImages, onLoad, onProgress, onError);
      // expect(texture).toBeInstanceOf(DataTexture); // empty provided immediately
    });
  });
});
