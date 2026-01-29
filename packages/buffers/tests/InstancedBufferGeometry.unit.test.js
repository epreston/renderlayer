import { describe, expect, it, test, vi } from 'vitest';

import { BufferGeometry } from '../src/BufferGeometry.js';
import { BufferAttribute } from '../src/BufferAttribute.js';
import { InstancedBufferGeometry } from '../src/InstancedBufferGeometry.js';

describe('Buffers', () => {
  describe('InstancedBufferGeometry', () => {
    function _createCloneableMock() {
      return {
        callCount: 0,
        clone: function () {
          this.callCount++;
          return this;
        }
      };
    }

    test('constructor', () => {
      const object = new InstancedBufferGeometry();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new InstancedBufferGeometry();
      expect(object).toBeInstanceOf(BufferGeometry);
    });

    test('isInstancedBufferGeometry', () => {
      const object = new InstancedBufferGeometry();
      expect(object.isInstancedBufferGeometry).toBeTruthy();
    });

    test('type', () => {
      const object = new InstancedBufferGeometry();
      expect(object.type).toBe('InstancedBufferGeometry');
    });

    test('instanceCount', () => {
      const object = new InstancedBufferGeometry();
      expect(object.instanceCount).toBe(Infinity);
    });

    test('copy', () => {
      const instanceMock1 = {};
      const instanceMock2 = {};
      const indexMock = _createCloneableMock();
      const defaultAttribute1 = new BufferAttribute(new Float32Array([1]));
      const defaultAttribute2 = new BufferAttribute(new Float32Array([2]));

      const instance = new InstancedBufferGeometry();

      // EP: type error ?
      instance.addGroup(0, 10, 0);
      instance.addGroup(10, 5, 1);
      instance.setIndex(indexMock);
      instance.setAttribute('defaultAttribute1', defaultAttribute1);
      instance.setAttribute('defaultAttribute2', defaultAttribute2);

      const copiedInstance = new InstancedBufferGeometry().copy(instance);

      expect(copiedInstance).toBeInstanceOf(InstancedBufferGeometry);

      expect(copiedInstance.index).toBe(indexMock);
      expect(copiedInstance.index.callCount).toBe(1);

      expect(copiedInstance.attributes['defaultAttribute1']).toBeInstanceOf(BufferAttribute);
      expect(copiedInstance.attributes['defaultAttribute1'].array).toEqual(defaultAttribute1.array);
      expect(copiedInstance.attributes['defaultAttribute2'].array).toEqual(defaultAttribute2.array);

      expect(copiedInstance.groups[0].start).toBe(0);
      expect(copiedInstance.groups[0].count).toBe(10);
      expect(copiedInstance.groups[0].materialIndex).toBe(0);

      expect(copiedInstance.groups[1].start).toBe(10);
      expect(copiedInstance.groups[1].count).toBe(5);
      expect(copiedInstance.groups[1].materialIndex).toBe(1);
    });

    test('toJSON', () => {
      const instance = new InstancedBufferGeometry();
      instance.uuid = 'eebb4977-88d8-47ff-9a70-5fa57dcb8ce5';
      expect(instance).toMatchInlineSnapshot(`
        {
          "data": {
            "attributes": {},
          },
          "instanceCount": Infinity,
          "isInstancedBufferGeometry": true,
          "metadata": {
            "generator": "BufferGeometry.toJSON",
            "type": "BufferGeometry",
            "version": 4.5,
          },
          "type": "InstancedBufferGeometry",
          "uuid": "eebb4977-88d8-47ff-9a70-5fa57dcb8ce5",
        }
      `);
    });
  });
});
