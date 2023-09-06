import { describe, expect, it, test, vi } from 'vitest';

import { BoxGeometry, SphereGeometry } from '@renderlayer/geometries';

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

    test('deepCloneAttribute', () => {
      expect(deepCloneAttribute).toBeDefined();
    });

    test('deinterleaveAttribute', () => {
      expect(deinterleaveAttribute).toBeDefined();
    });

    test('deinterleaveGeometry', () => {
      expect(deinterleaveGeometry).toBeDefined();
    });

    test('interleaveAttributes', () => {
      expect(interleaveAttributes).toBeDefined();
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
