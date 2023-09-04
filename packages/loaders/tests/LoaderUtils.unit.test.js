// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';

import { LoaderUtils } from '../src/LoaderUtils.js';

describe('Loaders', () => {
  describe('LoaderUtils', () => {
    test('decodeText', () => {
      const jsonArray = new Uint8Array([
        123, 34, 106, 115, 111, 110, 34, 58, 32, 116, 114, 117, 101, 125
      ]);
      expect(LoaderUtils.decodeText(jsonArray)).toEqual('{"json": true}');

      const multibyteArray = new Uint8Array([230, 151, 165, 230, 156, 172, 229, 155, 189]);
      expect(LoaderUtils.decodeText(multibyteArray)).toEqual('日本国');
    });

    test('extractUrlBase', () => {
      expect(LoaderUtils.extractUrlBase('/path/to/model.glb')).toEqual('/path/to/');
      expect(LoaderUtils.extractUrlBase('model.glb')).toEqual('./');
      expect(LoaderUtils.extractUrlBase('/model.glb')).toEqual('/');
    });

    // ----------------------
    // Valid URL / URI Passthrough
    // ----------------------

    test.each([
      'http://renderlayer.org', // Absolute URL
      'https://renderlayer.org', // Absolute URL
      '//renderlayer.org', // Absolute URL
      'data:,Hello%2C%20World%21', // Data URI
      'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==', // Data URI
      'data:text/html,%3Ch1%3EHello%2C%20World%21%3C%2Fh1%3E', // Data URI
      'blob:http://example.com/550e8400-e29b-41d4-a716-446655440000', // Blob URI
      'blob:https://javascript.info/1e67e00e-860d-40a5-89ae-6ab0cbee6273', //Blob URI
      'file:///C:/ProgramData/chocolatey/logs/chocolatey.log' // File URL - Patch
    ])('resolveURL -> %s', (url) => {
      const path = 'http://renderlayer.org';
      expect(LoaderUtils.resolveURL(url, path)).toBe(url);
    });

    // ----------------------
    // Invalid URL / URI returns empty string
    // ----------------------

    // prettier-ignore
    test.each([
      '',
      1,
      { test: 'test' },
    ])('resolveURL ≠ %s', (invalidURL) => {
      const path = 'http://renderlayer.org';
      expect(LoaderUtils.resolveURL(invalidURL, path)).toBe('');
    });

    // ----------------------
    // Relative URL - with path
    // ----------------------

    // prettier-ignore
    test.each([
      ['/', 'http://renderlayer.org/'],
      ['test.jpg', 'http://renderlayer.org/test.jpg'],
      ['./test.jpg', 'http://renderlayer.org/test.jpg'],
      ['/test.jpg', 'http://renderlayer.org/test.jpg'],
      ['/assets/test.jpg', 'http://renderlayer.org/assets/test.jpg'],
    ])('resolveURL : %s -> %s', (test, expected) => {
      const path = 'http://renderlayer.org';
      expect(LoaderUtils.resolveURL(test, path)).toBe(expected);
    });

    // ----------------------
    // Relative URL - no path
    // ----------------------

    const withPathInference = true;

    // prettier-ignore
    test.each([
      ['/', withPathInference ? 'http://localhost:3000/' : ''],
      ['test.jpg', withPathInference ? 'http://localhost:3000/test.jpg' : ''],
      ['./test.jpg', withPathInference ? 'http://localhost:3000/test.jpg' : ''],
      ['/test.jpg', withPathInference ? 'http://localhost:3000/test.jpg' : ''],
      ['/assets/test.jpg', withPathInference ? 'http://localhost:3000/assets/test.jpg' : ''],
    ])('resolveURL = %s -> \'%s\'', (test, expected) => {
      // const path = 'http://renderlayer.org';
      expect(LoaderUtils.resolveURL(test)).toBe(expected);
    });
  });
});
