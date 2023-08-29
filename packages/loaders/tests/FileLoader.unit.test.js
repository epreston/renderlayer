import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Loader } from '../src/Loader.js';
import { FileLoader } from '../src/FileLoader.js';

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
