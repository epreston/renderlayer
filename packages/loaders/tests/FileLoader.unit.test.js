import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Loader } from '../src/Loader.js';
import { FileLoader } from '../src/FileLoader.js';

describe('Loaders', () => {
  describe('FileLoader', () => {
    test('Extending', () => {
      const object = new FileLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test('Instancing', () => {
      const object = new FileLoader();
      expect(object).toBeDefined();
    });

    test.todo('load', () => {
      // implement
    });

    test.todo('setResponseType', () => {
      // implement
    });

    test.todo('setMimeType', () => {
      // implement
    });
  });
});
