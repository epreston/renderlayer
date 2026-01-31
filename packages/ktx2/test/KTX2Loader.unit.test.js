import { describe, expect, it, test, vi } from 'vitest';

import { Loader, FileLoader } from '@renderlayer/loaders';

import { KTX2Loader } from '../src/KTX2Loader.js';

describe('KTX2', () => {
  describe('KTX2Loader', () => {
    test('constructor', () => {
      const object = new KTX2Loader();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new KTX2Loader();
      expect(object).toBeInstanceOf(Loader);
    });

    test('transcoderPath', () => {
      const object = new KTX2Loader();
      expect(object.transcoderPath).toBe('');
    });

    test.todo('dispose', () => {
      // const object = new KTX2Loader();
      // object.dispose();
    });

    test('setTranscoderPath', () => {
      const object = new KTX2Loader();
      object.setTranscoderPath('test');

      expect(object.transcoderPath).toBe('test');
    });

    test('setWorkerLimit', () => {
      const object = new KTX2Loader();
      object.setWorkerLimit(1);

      expect(object).toBeDefined();
    });

    test.todo('detectSupport', () => {
      // const object = new KTX2Loader();
      // object.detectSupport();
    });

    test.todo('load', () => {
      // const object = new KTX2Loader();
      // object.load(url, onLoad, onProgress, onError);
    });

    test.todo('parse', () => {
      // const object = new KTX2Loader();
      // object.parse(buffer, onLoad, onError);
    });
  });
});
