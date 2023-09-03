// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';
import { resolveAfter, flushPromises } from './test-helpers.js';

import { BufferAttribute, BufferGeometry } from '@renderlayer/buffers';
import { DynamicDrawUsage } from '@renderlayer/shared';

import { Loader } from '../src/Loader.js';
import { BufferGeometryLoader } from '../src/BufferGeometryLoader.js';

// will be intercepted by msw, not a real url
const DataTestFile = 'http://renderlayer.org/test/json/BufferGeometry.json';
const MissingTestFile = 'http://renderlayer.org/test/json/missing.json';

describe('Loaders', () => {
  describe('BufferGeometryLoader', () => {
    test('constructor', () => {
      const object = new BufferGeometryLoader();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new BufferGeometryLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test('load', async () => {
      const onLoad = vi.fn();
      const onProgress = vi.fn(); // unused
      const onError = vi.fn();

      const object = new BufferGeometryLoader();

      // --------------------
      // good file
      object.load(DataTestFile, onLoad, onProgress, onError);

      // allow time for fetch and async code to compete before asserts
      // await resolveAfter(100);
      await flushPromises();
      expect(onLoad).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();

      vi.clearAllMocks();

      // --------------------
      // bad file
      object.load(MissingTestFile, onLoad, onProgress, onError);

      // allow time for fetch and async code to compete before asserts
      // await resolveAfter(100);
      await flushPromises();
      expect(onLoad).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
      expect('missing test file').toHaveBeenWarned();
    });

    test('parse', () => {
      const loader = new BufferGeometryLoader();
      const geometry = new BufferGeometry();
      const attr = new BufferAttribute(new Float32Array([7, 8, 9, 10, 11, 12]), 2, true);
      attr.name = 'attribute';
      attr.setUsage(DynamicDrawUsage);
      attr.updateRange.offset = 1;
      attr.updateRange.count = 2;

      geometry.setAttribute('attr', attr);

      const geometry2 = loader.parse(geometry.toJSON());

      expect(geometry2.getAttribute('attr')).toBeDefined();
      expect(geometry.getAttribute('attr')).toEqual(geometry2.getAttribute('attr'));
    });

    test('parser - attributes - circlable', () => {
      const loader = new BufferGeometryLoader();
      const geometry = new BufferGeometry();
      const attr = new BufferAttribute(new Float32Array([7, 8, 9, 10, 11, 12]), 2, true);
      attr.name = 'attribute';
      attr.setUsage(DynamicDrawUsage);
      attr.updateRange.offset = 1;
      attr.updateRange.count = 2;

      geometry.setAttribute('attr', attr);

      const geometry2 = loader.parse(geometry.toJSON());

      expect(geometry2.getAttribute('attr')).toBeDefined();
      expect(geometry.getAttribute('attr')).toEqual(geometry2.getAttribute('attr'));
    });
  });
});
