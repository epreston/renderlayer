import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { LoaderUtils } from '../src/LoaderUtils.js';

describe('Loaders', () => {
  describe('LoaderUtils', () => {
    test('decodeText', () => {
      const jsonArray = new Uint8Array([123, 34, 106, 115, 111, 110, 34, 58, 32, 116, 114, 117, 101, 125]);
      expect(LoaderUtils.decodeText(jsonArray)).toEqual('{"json": true}');

      const multibyteArray = new Uint8Array([230, 151, 165, 230, 156, 172, 229, 155, 189]);
      expect(LoaderUtils.decodeText(multibyteArray)).toEqual('日本国');
    });

    test('extractUrlBase', () => {
      expect(LoaderUtils.extractUrlBase('/path/to/model.glb')).toEqual('/path/to/');
      expect(LoaderUtils.extractUrlBase('model.glb')).toEqual('./');
      expect(LoaderUtils.extractUrlBase('/model.glb')).toEqual('/');
    });

    test.todo('resolveURL', () => {
      // static resolveURL( url, path )
      // implement
    });
  });
});
