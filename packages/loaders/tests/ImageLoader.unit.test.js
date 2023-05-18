import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Loader } from '../src/Loader.js';
import { ImageLoader } from '../src/ImageLoader.js';

describe('Loaders', () => {
  describe('ImageLoader', () => {
    test('Instancing', () => {
      const object = new ImageLoader();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new ImageLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test.todo('load', () => {
      // implement
    });
  });
});
