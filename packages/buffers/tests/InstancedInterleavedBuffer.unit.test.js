import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { InterleavedBuffer } from '../src/InterleavedBuffer.js';
import { InstancedInterleavedBuffer } from '../src/InstancedInterleavedBuffer.js';

describe('Buffers', () => {
  describe('InstancedInterleavedBuffer', () => {
    test('constructor', () => {
      const array = new Float32Array([1, 2, 3, 7, 8, 9]);
      const instance = new InstancedInterleavedBuffer(array, 3);

      expect(instance.meshPerAttribute === 1).toBeTruthy();
    });

    test('extends', () => {
      const object = new InstancedInterleavedBuffer();
      expect(object).toBeInstanceOf(InterleavedBuffer);
    });

    test.todo('meshPerAttribute', () => {
      // implement
    });

    test('isInstancedInterleavedBuffer', () => {
      const object = new InstancedInterleavedBuffer();
      expect(object.isInstancedInterleavedBuffer).toBeTruthy();
    });

    test('copy', () => {
      const array = new Float32Array([1, 2, 3, 7, 8, 9]);
      const instance = new InstancedInterleavedBuffer(array, 3);
      const copiedInstance = instance.copy(instance);

      expect(copiedInstance.meshPerAttribute === 1).toBeTruthy();
    });

    test.todo('clone', () => {
      // implement
    });

    test.todo('toJSON', () => {
      // implement
    });
  });
});
