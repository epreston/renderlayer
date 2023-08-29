import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { DynamicDrawUsage } from '@renderlayer/shared';
import { InterleavedBuffer } from '../src/InterleavedBuffer.js';

describe('Core', () => {
  describe('InterleavedBuffer', () => {
    function checkInstanceAgainstCopy(instance, copiedInstance) {
      expect(copiedInstance).toBeInstanceOf(InterleavedBuffer);

      for (let i = 0; i < instance.array.length; i++) {
        expect(copiedInstance.array[i] === instance.array[i]).toBeTruthy();
      }

      expect(copiedInstance.stride === instance.stride).toBeTruthy();
      expect(copiedInstance.usage === DynamicDrawUsage).toBeTruthy();
    }

    test('constructor', () => {
      const object = new InterleavedBuffer();
      expect(object).toBeDefined();
    });

    test.todo('array', () => {
      // implement
    });

    test.todo('stride', () => {
      // implement
    });

    test('count', () => {
      const instance = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);

      expect(instance.count).toBe(2);
    });

    test.todo('usage', () => {
      // implement
    });

    test.todo('updateRange', () => {
      // implement
    });

    test.todo('version', () => {
      // implement
    });

    test('uuid', () => {
      const object = new InterleavedBuffer();

      expect(object.uuid).to.be.a('string');
      expect(object.uuid).to.have.length(36);
    });

    test.todo('onUploadCallback', () => {
      // implement
    });

    test('needsUpdate', () => {
      const a = new InterleavedBuffer(new Float32Array([1, 2, 3, 4]), 2);
      a.needsUpdate = true;

      expect(a.version).toBe(1);
    });

    test('isInterleavedBuffer', () => {
      const object = new InterleavedBuffer();
      expect(object.isInterleavedBuffer).toBeTruthy();
    });

    test('setUsage', () => {
      const instance = new InterleavedBuffer();
      instance.setUsage(DynamicDrawUsage);

      expect(instance.usage).toBe(DynamicDrawUsage);
    });

    test('copy', () => {
      const array = new Float32Array([1, 2, 3, 7, 8, 9]);
      const instance = new InterleavedBuffer(array, 3);
      instance.setUsage(DynamicDrawUsage);

      checkInstanceAgainstCopy(instance, instance.copy(instance));
    });

    test('copyAt', () => {
      const a = new InterleavedBuffer(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]), 3);
      const b = new InterleavedBuffer(new Float32Array(9), 3);
      const expected = new Float32Array([4, 5, 6, 7, 8, 9, 1, 2, 3]);

      b.copyAt(1, a, 2);
      b.copyAt(0, a, 1);
      b.copyAt(2, a, 0);

      expect(b.array).toMatchObject(expected);
    });

    test('set', () => {
      const instance = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);

      instance.set([0, -1]);
      expect(instance.array[0] === 0 && instance.array[1] === -1).toBeTruthy();
    });

    test.todo('clone', () => {
      // implement
    });

    test('onUpload', () => {
      const a = new InterleavedBuffer();
      const func = vi.fn();

      a.onUpload(func);

      expect(a.onUploadCallback).toBe(func);
    });

    test.todo('toJSON', () => {
      // implement
    });
  });
});
