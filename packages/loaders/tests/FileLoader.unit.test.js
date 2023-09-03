// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';
import { resolveAfter, flushPromises } from './test-helpers.js';

import { Loader } from '../src/Loader.js';
import { FileLoader } from '../src/FileLoader.js';

// will be intercepted by msw, not a real url
const DataTestFile = 'http://renderlayer.org/test/json/data.json';
const MissingTestFile = 'http://renderlayer.org/test/json/missing.json';

describe('Loaders', () => {
  describe('FileLoader', () => {
    test('extends', () => {
      const object = new FileLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test('constructor', () => {
      const object = new FileLoader();
      expect(object).toBeDefined();
    });

    test('load', async () => {
      const onLoad = vi.fn();
      const onProgress = vi.fn(); // unused
      const onError = vi.fn();

      const object = new FileLoader();

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

    test.todo('setResponseType', () => {
      // implement
    });

    test.todo('setMimeType', () => {
      // implement
    });
  });
});
