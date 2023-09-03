import { describe, expect, it, test, vi } from 'vitest';

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

    test('load', () => {
      // abstract method
      const object = new Loader();
      expect(object.load).toBeDefined();

      const url = 'test/file.json';
      const onLoad = vi.fn();
      const onProgress = vi.fn();
      const onError = vi.fn();

      // @ts-ignore
      object.load(url, onLoad, onProgress, onError);
    });

    test('loadAsync', async () => {
      // promise wrapper for abstract load method
      const object = new Loader();
      expect(object.loadAsync).toBeDefined();

      // abstract load method will not resolve
    });

    test('parse', () => {
      // abstract method
      const object = new Loader();
      expect(object.parse).toBeDefined();

      const data = { test: 'test' };

      // @ts-ignore
      object.parse(data);
    });

    test('setCrossOrigin', () => {
      const object = new Loader();
      object.setCrossOrigin('same-origin');
      expect(object.crossOrigin).toBe('same-origin');
    });

    test('setWithCredentials', () => {
      const object = new Loader();
      object.setWithCredentials(true);
      expect(object.withCredentials).toBe(true);
    });

    test('setPath', () => {
      const object = new Loader();
      object.setPath('./test/');
      expect(object.path).toBe('./test/');
    });

    test('setResourcePath', () => {
      const object = new Loader();
      object.setResourcePath('assets/');
      expect(object.resourcePath).toBe('assets/');
    });

    test('setRequestHeader', () => {
      const object = new Loader();
      object.setRequestHeader({ 'Save-Data': 'off' });
      expect(object.requestHeader).toStrictEqual({ 'Save-Data': 'off' });
    });
  });
});
