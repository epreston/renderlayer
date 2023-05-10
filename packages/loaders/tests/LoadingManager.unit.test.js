import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Loader } from '../src/Loader.js';
import { LoadingManager } from '../src/LoadingManager.js';

describe('Loaders', () => {
  describe('LoadingManager', () => {
    test('Instancing', () => {
      // no params
      const object = new LoadingManager();
      expect(object).toBeDefined();

      // onLoad, onProgress, onError
    });

    test.todo('onStart', () => {
      // Refer to #5689 for the reason why we don't set .onStart
      // in the constructor
      // implement
    });

    test.todo('onLoad', () => {
      // implement
    });

    test.todo('onProgress', () => {
      // implement
    });

    test.todo('onError', () => {
      // implement
    });

    test.todo('itemStart', () => {
      // implement
    });

    test.todo('itemEnd', () => {
      // implement
    });

    test.todo('itemError', () => {
      // implement
    });

    test.todo('resolveURL', () => {
      // implement
    });

    test.todo('setURLModifier', () => {
      // implement
    });

    test.todo('addHandler', () => {
      // addHandler( regex, loader )
      // implement
    });

    test.todo('removeHandler', () => {
      // removeHandler( regex )
      // implement
    });

    test.todo('getHandler', () => {
      // getHandler( file )
      // implement
    });

    test('addHandler/getHandler/removeHandler', () => {
      const loadingManager = new LoadingManager();
      const loader = new Loader();

      const regex1 = /\.jpg$/i;
      const regex2 = /\.jpg$/gi;

      loadingManager.addHandler(regex1, loader);

      expect(loadingManager.getHandler('foo.jpg')).toBe(loader);
      expect(loadingManager.getHandler('foo.jpg.png')).toBeNull();
      expect(loadingManager.getHandler('foo.jpeg')).toBeNull();

      loadingManager.removeHandler(regex1);
      loadingManager.addHandler(regex2, loader);

      expect(loadingManager.getHandler('foo.jpg')).toBe(loader);
      expect(loadingManager.getHandler('foo.jpg')).toBe(loader); // second test, see #17920.
    });
  });
});
