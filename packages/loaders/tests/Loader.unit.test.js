import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { LoadingManager } from '../src/LoadingManager.js';
import { Loader } from '../src/Loader.js';

describe('Loaders', () => {
  describe('Loader', () => {
    test('constructor', () => {
      const object = new Loader();
      expect(object).toBeDefined();
    });

    test('manager', () => {
      // uses default LoadingManager if not supplied in constructor
      const object = new Loader().manager;
      expect(object).toBeInstanceOf(LoadingManager);
    });

    test('crossOrigin', () => {
      const actual = new Loader().crossOrigin;
      const expected = 'anonymous';
      expect(actual).toBe(expected);
    });

    test('withCredentials', () => {
      const actual = new Loader().withCredentials;
      const expected = false;
      expect(actual).toBe(expected);
    });

    test('path', () => {
      const actual = new Loader().path;
      const expected = '';
      expect(actual).toBe(expected);
    });

    test('resourcePath', () => {
      const actual = new Loader().resourcePath;
      const expected = '';
      expect(actual).toBe(expected);
    });

    test('requestHeader', () => {
      const actual = new Loader().requestHeader;
      const expected = {};
      expect(actual).toEqual(expected);
    });

    test.todo('load', () => {
      // implement
    });

    test.todo('loadAsync', () => {
      // implement
    });

    test.todo('parse', () => {
      // implement
    });

    test.todo('setCrossOrigin', () => {
      // implement
    });

    test.todo('setWithCredentials', () => {
      // implement
    });

    test.todo('setPath', () => {
      // implement
    });

    test.todo('setResourcePath', () => {
      // implement
    });

    test.todo('setRequestHeader', () => {
      // implement
    });
  });
});
