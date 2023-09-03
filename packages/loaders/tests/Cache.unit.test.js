import { describe, expect, it, test, vi } from 'vitest';

import { Cache } from '../src/Cache.js';

describe('Loaders', () => {
  describe('Cache', () => {
    const testKey = '/test/file.json';
    const testFile = { name: 'test' };

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
      Cache.add(testKey, testFile);

      expect(Cache.files).toMatchInlineSnapshot('{}');

      Cache.enabled = true;
      Cache.add(testKey, testFile);

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
      Cache.add(testKey, testFile);

      expect(Cache.files).toMatchInlineSnapshot(`
        {
          "/test/file.json": {
            "name": "test",
          },
        }
      `);

      const file = Cache.get(testKey);
      expect(file).toStrictEqual(testFile);

      Cache.enabled = false;

      expect(Cache.files).toMatchInlineSnapshot(`
        {
          "/test/file.json": {
            "name": "test",
          },
        }
      `);

      const disabledNotFound = Cache.get(testKey);
      expect(disabledNotFound).toBeUndefined();
    });

    test('remove', () => {
      Cache.enabled = true;
      Cache.add(testKey, testFile);

      expect(Cache.files).toMatchInlineSnapshot(`
        {
          "/test/file.json": {
            "name": "test",
          },
        }
      `);

      Cache.enabled = false;
      Cache.remove(testKey);

      // clear works even when disabled
      expect(Cache.files).toMatchInlineSnapshot('{}');
    });

    test('clear', () => {
      Cache.enabled = true;
      Cache.clear();

      expect(Cache.files).toMatchInlineSnapshot('{}');

      Cache.enabled = true;
      Cache.add(testKey, testFile);
      Cache.enabled = false;
      Cache.clear();

      // clear works even when disabled
      expect(Cache.files).toMatchInlineSnapshot('{}');
    });
  });
});
