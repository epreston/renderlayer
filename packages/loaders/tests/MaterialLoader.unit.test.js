// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';
import { resolveAfter, flushPromises } from './test-helpers.js';

import { Loader } from '../src/Loader.js';
import { MaterialLoader } from '../src/MaterialLoader.js';

// will be intercepted by msw, not a real url
const MatTestFile = 'http://renderlayer.org/test/json/material.json';
const ShaderMatTestFile = 'http://renderlayer.org/test/json/shadermaterial.json';
const MissingTestFile = 'http://renderlayer.org/test/json/missing.json';

describe('Loaders', () => {
  describe('MaterialLoader', () => {
    test('constructor', () => {
      const object = new MaterialLoader();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new MaterialLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test('textures', () => {
      const actual = new MaterialLoader().textures;
      const expected = {};
      expect(actual).toEqual(expected);
    });

    test('load', async () => {
      const onLoad = vi.fn();
      const onProgress = vi.fn(); // unused
      const onError = vi.fn();

      const object = new MaterialLoader();

      // --------------------
      // MeshBasicMaterial file
      object.load(MatTestFile, onLoad, onProgress, onError);

      // allow time for fetch and async code to compete before asserts
      // await resolveAfter(100);
      await flushPromises();
      expect(onLoad).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();

      vi.clearAllMocks();

      // --------------------
      // ShaderMaterial file
      object.load(ShaderMatTestFile, onLoad, onProgress, onError);

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

    test.todo('parse', () => {
      // implement
    });

    test.todo('setTextures', () => {
      // implement
    });

    test.todo('createMaterialFromType', () => {
      // static createMaterialFromType( type )
      // implement
    });
  });
});
