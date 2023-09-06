import { describe, expect, it, test, vi } from 'vitest';

import { BoxGeometry, SphereGeometry } from '@renderlayer/geometries';

import { InstancedBufferAttribute } from '../src/InstancedBufferAttribute.js';

import {
  deepCloneAttribute,
  deinterleaveAttribute,
  deinterleaveGeometry,
  mergeGeometries,
  mergeAttributes,
  interleaveAttributes,
  estimateBytesUsed,
  mergeVertices,
  toTrianglesDrawMode,
  computeMorphedAttributes,
  mergeGroups,
  toCreasedNormals
} from '../src/BufferGeometryUtils.js';
import { InterleavedBufferAttribute } from '../src/InterleavedBufferAttribute.js';
import { InterleavedBuffer } from '../src/InterleavedBuffer.js';

describe('Buffers', () => {
  describe('BufferGeometryUtils', () => {
    test('mergeGeometries', () => {
      expect(mergeGeometries).toBeDefined();

      const boxGeometry = new BoxGeometry(1, 1, 1, 1, 1, 1);
      const sphereGeometry = new SphereGeometry(1, 32, 16);
      const combinedGeometry = mergeGeometries([boxGeometry, sphereGeometry], true);

      const boxPos = boxGeometry.getAttribute('position');
      const spherePos = sphereGeometry.getAttribute('position');
      const combinedPos = combinedGeometry.getAttribute('position');

      expect(combinedPos.count).toBe(boxPos.count + spherePos.count);
    });

    test('mergeAttributes', () => {
      expect(mergeAttributes).toBeDefined();

      const boxGeometry = new BoxGeometry(1, 1, 1, 1, 1, 1);
      const sphereGeometry = new SphereGeometry(1, 32, 16);

      const boxPos = boxGeometry.getAttribute('position');
      const spherePos = sphereGeometry.getAttribute('position');
      const attributes = [boxPos, spherePos];

      const mergedAttribute = mergeAttributes(attributes);

      expect(mergedAttribute.count).toBe(boxPos.count + spherePos.count);
    });

    test('deepCloneAttribute - Float32BufferAttribute', () => {
      expect(deepCloneAttribute).toBeDefined();

      const boxGeometry = new BoxGeometry(1, 1, 1, 1, 1, 1);
      const boxPos = boxGeometry.getAttribute('position');

      // Float32BufferAttribute in, BufferAttribute out
      const boxClone = deepCloneAttribute(boxPos);

      expect(boxClone).not.toBe(boxPos);
      expect(boxClone.array).toStrictEqual(boxPos.array);
    });

    test('deepCloneAttribute - InstancedBufferAttribute', () => {
      const instancedAttrib = new InstancedBufferAttribute(new Float32Array(10), 2, false, 123);

      // InstancedBufferAttribute in, InstancedBufferAttribute out
      const instancedClone = deepCloneAttribute(instancedAttrib);

      expect(instancedClone).not.toBe(instancedAttrib);
      expect(instancedClone).toStrictEqual(instancedAttrib);
    });

    test('deepCloneAttribute - InterleavedBufferAttribute', () => {
      const interleavedBuff = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const interleavedAttrib = new InterleavedBufferAttribute(interleavedBuff, 2, 0);

      // InterleavedBufferAttribute in, BufferAttribute out
      const interleavedClone = deepCloneAttribute(interleavedAttrib);

      expect(interleavedClone).not.toBe(interleavedAttrib);

      // expect('de-interleave buffer data').toHaveBeenWarned();
    });

    test('interleaveAttributes', () => {
      expect(interleaveAttributes).toBeDefined();
    });

    test('deinterleaveAttribute', () => {
      expect(deinterleaveAttribute).toBeDefined();
    });

    test('deinterleaveGeometry', () => {
      expect(deinterleaveGeometry).toBeDefined();
    });

    test('estimateBytesUsed', () => {
      expect(estimateBytesUsed).toBeDefined();
    });

    test('mergeVertices', () => {
      expect(mergeVertices).toBeDefined();
    });

    test('toTrianglesDrawMode', () => {
      expect(toTrianglesDrawMode).toBeDefined();
    });

    test('computeMorphedAttributes', () => {
      expect(computeMorphedAttributes).toBeDefined();
    });

    test('mergeGroups', () => {
      expect(mergeGroups).toBeDefined();
    });

    test('toCreasedNormals', () => {
      expect(toCreasedNormals).toBeDefined();
    });
  });
});
