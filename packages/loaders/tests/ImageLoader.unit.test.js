import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Loader } from '../src/Loader.js';
import { ImageLoader } from '../src/ImageLoader.js';

describe('Loaders', () => {
  describe('ImageLoader', () => {
    test('constructor', () => {
      const object = new ImageLoader();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new ImageLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test.todo('load', () => {
      // implement
    });
  });
});
