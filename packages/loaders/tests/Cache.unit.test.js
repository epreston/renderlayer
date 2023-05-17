import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Cache } from '../src/Cache.js';

describe('Loaders', () => {
  describe('Cache', () => {
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

    test.todo('add', () => {
      // function ( key, file )
      // implement
    });

    test.todo('get', () => {
      // function ( key )
      // implement
    });

    test.todo('remove', () => {
      // function ( key )
      // implement
    });

    test.todo('clear', () => {
      // implement
    });
  });
});
