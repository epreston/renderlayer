// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';
import { resolveAfter, flushPromises } from './test-helpers.js';

import { DataTexture } from '@renderlayer/textures';

import { Loader } from '../src/Loader.js';
import { DataTextureLoader } from '../src/DataTextureLoader.js';

describe('Loaders', () => {
  describe('DataTextureLoader', () => {
    // will be intercepted by msw, not a real url
    // const _UVTestFile = 'http://renderlayer.org/test/jpeg/uvcheck.jpg';
    // const _MissingTestFile = 'http://renderlayer.org/test/jpeg/missing.jpg';

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
      // const cubeImages = [_UVTestFile, _UVTestFile, _UVTestFile, _UVTestFile, _UVTestFile, _UVTestFile];
      // will not make a network request in mock environment
      // const texture = object.load(cubeImages, onLoad, onProgress, onError);
      // expect(texture).toBeInstanceOf(DataTexture); // empty provided immediately
    });
  });
});
