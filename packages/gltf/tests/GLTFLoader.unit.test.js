import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { GLTFLoader } from '../src/GLTFLoader.js';
import { Loader } from '@renderlayer/loaders';

describe('GLTF', () => {
  describe('GLTFLoader', () => {
    test('constructor', () => {
      const object = new GLTFLoader();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new GLTFLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test.todo('load', () => {
      // implement
    });

    test.todo('setDRACOLoader', () => {
      // implement
    });

    test.todo('setDDSLoader', () => {
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
