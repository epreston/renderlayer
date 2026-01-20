import { describe, expect, it, test, vi } from 'vitest';

import { Cache } from '../src/Cache.js';

describe('Loaders', () => {
  describe('Cache', () => {
    const _testKey = '/test/file.json';
    const _testFile = { name: 'test' };

    test('enabled', () => {
      const actual = Cache.enabled;
      const expected = false;
      expect(actual).toBe(expected);
    });

    test('files', () => {
      const actual = Cache.files;
      const expected = {};
      expect(actual).toEqual(expected);
    });

    test('add', () => {
      Cache.enabled = false;
      Cache.add(_testKey, _testFile);

      expect(Cache.files).toMatchInlineSnapshot('{}');

      Cache.enabled = true;
      Cache.add(_testKey, _testFile);

      expect(Cache.files).toMatchInlineSnapshot(`
        {
          "/test/file.json": {
            "name": "test",
          },
        }
      `);
    });

    test('get', () => {
      Cache.enabled = true;
      Cache.add(_testKey, _testFile);

      expect(Cache.files).toMatchInlineSnapshot(`
        {
          "/test/file.json": {
            "name": "test",
          },
        }
      `);

      const file = Cache.get(_testKey);
      expect(file).toStrictEqual(_testFile);

      Cache.enabled = false;

      expect(Cache.files).toMatchInlineSnapshot(`
        {
          "/test/file.json": {
            "name": "test",
          },
        }
      `);

      const disabledNotFound = Cache.get(_testKey);
      expect(disabledNotFound).toBeUndefined();
    });

    test('remove', () => {
      Cache.enabled = true;
      Cache.add(_testKey, _testFile);

      expect(Cache.files).toMatchInlineSnapshot(`
        {
          "/test/file.json": {
            "name": "test",
          },
        }
      `);

      Cache.enabled = false;
      Cache.remove(_testKey);

      // clear works even when disabled
      expect(Cache.files).toMatchInlineSnapshot('{}');
    });

    test('clear', () => {
      Cache.enabled = true;
      Cache.clear();

      expect(Cache.files).toMatchInlineSnapshot('{}');

      Cache.enabled = true;
      Cache.add(_testKey, _testFile);
      Cache.enabled = false;
      Cache.clear();

      // clear works even when disabled
      expect(Cache.files).toMatchInlineSnapshot('{}');
    });
  });
});
