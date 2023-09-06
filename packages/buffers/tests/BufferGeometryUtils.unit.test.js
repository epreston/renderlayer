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

      const boxGeometry = new BoxGeometry(1, 1, 1, 1, 1, 1);
      const boxPos = boxGeometry.getAttribute('position');
      const boxNormal = boxGeometry.getAttribute('normal');
      const boxUV = boxGeometry.getAttribute('uv');
      const attributes = [boxPos, boxNormal, boxUV];

      const interleavedAttribs = interleaveAttributes(attributes);

      expect(interleavedAttribs.length).toBe(attributes.length);
    });

    test('deinterleaveAttribute', () => {
      expect(deinterleaveAttribute).toBeDefined();

      const boxGeometry = new BoxGeometry(1, 1, 1, 1, 1, 1);
      const boxPos = boxGeometry.getAttribute('position');
      const boxNormal = boxGeometry.getAttribute('normal');
      const boxUV = boxGeometry.getAttribute('uv');
      const attributes = [boxPos, boxNormal, boxUV];

      const interleavedAttribs = interleaveAttributes(attributes);

      expect(interleavedAttribs.length).toBe(attributes.length);

      const deinterleavedAttrib = deinterleaveAttribute(interleavedAttribs[1]);

      expect(deinterleavedAttrib.array).toStrictEqual(boxNormal.array);
    });

    test('deinterleaveGeometry', () => {
      expect(deinterleaveGeometry).toBeDefined();

      const boxGeometry = new BoxGeometry(1, 1, 1, 1, 1, 1);

      const boxPos = boxGeometry.getAttribute('position');
      const boxNormal = boxGeometry.getAttribute('normal');
      const boxUV = boxGeometry.getAttribute('uv');

      const attributes = [boxPos, boxNormal, boxUV];
      const interleavedAttribs = interleaveAttributes(attributes);

      expect(interleavedAttribs.length).toBe(attributes.length);

      boxGeometry.setAttribute('position', interleavedAttribs[0]);
      boxGeometry.setAttribute('normal', interleavedAttribs[1]);
      boxGeometry.setAttribute('uv', interleavedAttribs[2]);

      const interleavedBoxPos = boxGeometry.getAttribute('position');
      const interleavedBoxNormal = boxGeometry.getAttribute('normal');
      const interleavedBoxUV = boxGeometry.getAttribute('uv');

      expect(interleavedBoxPos).toBe(interleavedAttribs[0]);
      expect(interleavedBoxNormal).toBe(interleavedAttribs[1]);
      expect(interleavedBoxUV).toBe(interleavedAttribs[2]);

      deinterleaveGeometry(boxGeometry);

      // should have been returned to the starting state
      expect(boxGeometry.getAttribute('position').array).toStrictEqual(attributes[0].array);
      expect(boxGeometry.getAttribute('normal').array).toStrictEqual(attributes[1].array);
      expect(boxGeometry.getAttribute('uv').array).toStrictEqual(attributes[2].array);
    });

    test('estimateBytesUsed', () => {
      expect(estimateBytesUsed).toBeDefined();

      const boxGeometry = new BoxGeometry(1, 1, 1, 1, 1, 1);
      const bytesUsed = estimateBytesUsed(boxGeometry);

      expect(bytesUsed).toBe(840);
    });

    test('mergeVertices', () => {
      expect(mergeVertices).toBeDefined();

      const sphereGeometry = new SphereGeometry(1, 64, 32);

      const optimisedSphere = mergeVertices(sphereGeometry, 0.1);

      const sphereVertices = sphereGeometry.getAttribute('position');
      const optimisedVertices = optimisedSphere.getAttribute('position');

      expect(optimisedVertices.count).toBeLessThan(sphereVertices.count);
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
