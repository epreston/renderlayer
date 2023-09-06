import { describe, expect, it, test, vi } from 'vitest';

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
    });

    test('mergeAttributes', () => {
      expect(mergeAttributes).toBeDefined();
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
