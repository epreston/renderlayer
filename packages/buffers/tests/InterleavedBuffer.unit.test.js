import { describe, expect, it, test, vi } from 'vitest';

import { DynamicDrawUsage, StaticDrawUsage } from '@renderlayer/shared';

import { InterleavedBuffer } from '../src/InterleavedBuffer.js';

describe('Buffers', () => {
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

    test('isInterleavedBuffer', () => {
      const object = new InterleavedBuffer();
      expect(object.isInterleavedBuffer).toBeTruthy();
    });

    test('array', () => {
      const dataArray = new Float32Array([1, 2, 3, 7, 8, 9]);
      const object = new InterleavedBuffer(dataArray, 3);
      expect(object.array).toBe(dataArray);
    });

    test('stride', () => {
      const object = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      expect(object.stride).toBe(3);
    });

    test('count', () => {
      const object = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      expect(object.count).toBe(2);
    });

    test('usage', () => {
      const object = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      expect(object.usage).toBe(StaticDrawUsage);
    });

    test.todo('updateRange', () => {
      // implement
    });

    test('version', () => {
      const object = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      expect(object.version).toBe(0);
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

    test('setUsage', () => {
      const object = new InterleavedBuffer();
      object.setUsage(DynamicDrawUsage);

      expect(object.usage).toBe(DynamicDrawUsage);
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

    test('clone', () => {
      const object = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const data = {};
      const clonedObject = object.clone(data);

      // will be different
      clonedObject.uuid = object.uuid;

      expect(clonedObject).not.toBe(object);
      expect(clonedObject).toStrictEqual(object);
    });

    test('onUpload', () => {
      const a = new InterleavedBuffer();
      const func = vi.fn();

      a.onUpload(func);

      expect(a.onUploadCallback).toBe(func);
    });

    test('toJSON', () => {
      const object = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      object.uuid = '29bf3df6-7dcd-477a-ba66-21b15ac0ffe6';
      object.array.buffer._uuid = 'ef947120-656c-44f5-b9c6-bea826d1f4ce';

      const data = {};

      expect(object.toJSON(data)).toMatchInlineSnapshot(`
        {
          "buffer": "ef947120-656c-44f5-b9c6-bea826d1f4ce",
          "stride": 3,
          "type": "Float32Array",
          "uuid": "29bf3df6-7dcd-477a-ba66-21b15ac0ffe6",
        }
      `);
    });
  });
});
