import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { BufferAttribute, BufferGeometry } from '@renderlayer/buffers';
import { DynamicDrawUsage } from '@renderlayer/shared';
import { Loader } from '../src/Loader.js';
import { BufferGeometryLoader } from '../src/BufferGeometryLoader.js';

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

    test.todo('load', () => {
      // implement
    });

    test.todo('parse', () => {
      // implement
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
