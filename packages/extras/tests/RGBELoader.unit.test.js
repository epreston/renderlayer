// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';
// import { resolveAfter, flushPromises } from './test-helpers.js';

import { DataTexture } from '@renderlayer/textures';
import { DataTextureLoader } from '@renderlayer/loaders';

import { RGBELoader } from '../src/RGBELoader.js';

// will be intercepted by msw, not a real url
// const UVTestFile = 'http://renderlayer.org/test/jpeg/env.hdr';
// const MissingTestFile = 'http://renderlayer.org/test/jpeg/missing.hdr';

describe('Extras', () => {
  describe('RGBELoader', () => {
    test('constructor', () => {
      const object = new RGBELoader();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new RGBELoader();
      expect(object).toBeInstanceOf(DataTextureLoader);
    });

    test.todo('load - partial', async () => {
      // const onLoad = vi.fn();
      // const onProgress = vi.fn(); // unused
      // const onError = vi.fn();
      // const object = new RGBELoader();
      // will not make a network request in mock environment
      // const texture = object.load(hdrImage, onLoad, onProgress, onError);
      // expect(texture).toBeInstanceOf(DataTexture); // empty provided immediately
    });
  });
});
