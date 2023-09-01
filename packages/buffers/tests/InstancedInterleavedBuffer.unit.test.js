import { describe, expect, it, test, vi } from 'vitest';

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

    test('isInstancedInterleavedBuffer', () => {
      const object = new InstancedInterleavedBuffer();
      expect(object.isInstancedInterleavedBuffer).toBeTruthy();
    });

    test.todo('meshPerAttribute', () => {
      // implement
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

    test('toJSON', () => {
      const array = new Float32Array([1, 2, 3, 7, 8, 9]);
      const instance = new InstancedInterleavedBuffer(array, 3);
      instance.uuid = '67247c5e-822e-4ddf-929f-d3082629d644';
      instance.array.buffer._uuid = '8a7a4b09-dddb-42a2-8ecd-ff4c1a400ae3';

      const data = {};

      expect(instance.toJSON(data)).toMatchInlineSnapshot(`
        {
          "buffer": "8a7a4b09-dddb-42a2-8ecd-ff4c1a400ae3",
          "isInstancedInterleavedBuffer": true,
          "meshPerAttribute": 1,
          "stride": 3,
          "type": "Float32Array",
          "uuid": "67247c5e-822e-4ddf-929f-d3082629d644",
        }
      `);
    });
  });
});
