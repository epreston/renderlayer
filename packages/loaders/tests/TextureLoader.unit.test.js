import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Loader } from '../src/Loader.js';
import { TextureLoader } from '../src/TextureLoader.js';

describe('Loaders', () => {
  describe('TextureLoader', () => {
    test('constructor', () => {
      const object = new TextureLoader();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new TextureLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test.todo('load', () => {
      // implement
    });
  });
});
