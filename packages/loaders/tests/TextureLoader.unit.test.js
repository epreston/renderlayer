import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Loader } from '../src/Loader.js';
import { TextureLoader } from '../src/TextureLoader.js';

describe('Loaders', () => {
  describe('TextureLoader', () => {
    test('Instancing', () => {
      const object = new TextureLoader();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new TextureLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test.todo('load', () => {
      // implement
    });
  });
});
