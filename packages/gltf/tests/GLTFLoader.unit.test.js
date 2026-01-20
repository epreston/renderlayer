// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';
import { resolveAfter } from './test-helpers.js';

import { Loader } from '@renderlayer/loaders';
import { GLTFLoader } from '../src/GLTFLoader.js';

describe('GLTF', () => {
  describe('GLTFLoader', () => {
    // will be intercepted by msw, not a real url
    const _BoxTestFile = 'http://renderlayer.org/test/gltf/Box.gltf';
    const _MissingTestFile = 'http://renderlayer.org/test/gltf/Missing.gltf';

    test('constructor', () => {
      const object = new GLTFLoader();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new GLTFLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test('load - good file', async () => {
      const onLoad = vi.fn();
      const onProgress = vi.fn();
      const onError = vi.fn();

      const object = new GLTFLoader();

      // good file
      object.load(_BoxTestFile, onLoad, onProgress, onError);

      // allow time for fetch and async code to compete before asserts
      await resolveAfter(100);
      expect(onLoad).toHaveBeenCalled();
      expect(onProgress).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    test('load - bad file', async () => {
      const onLoad = vi.fn();
      const onProgress = vi.fn();
      const onError = vi.fn();

      const object = new GLTFLoader();

      // bad file
      object.load(_MissingTestFile, onLoad, onProgress, onError);

      // allow time for fetch and async code to compete before asserts
      await resolveAfter(100);
      expect(onLoad).not.toHaveBeenCalled();
      expect(onProgress).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
      expect('missing test file').toHaveBeenWarned();
    });

    test.todo('setDRACOLoader', () => {
      // implement
    });

    test.todo('setKTX2Loader', () => {
      // implement
    });

    test.todo('setMeshoptDecoder', () => {
      // implement
    });

    test.todo('register', () => {
      // implement
    });

    test.todo('unregister', () => {
      // implement
    });

    test.todo('parse', () => {
      // implement
    });

    test.todo('parseAsync', () => {
      // implement
    });
  });
});
