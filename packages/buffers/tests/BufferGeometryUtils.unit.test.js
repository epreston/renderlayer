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
    it('deepCloneAttribute', () => {
      expect(deepCloneAttribute).toBeDefined();
    });

    it('deinterleaveAttribute', () => {
      expect(deinterleaveAttribute).toBeDefined();
    });

    it('deinterleaveGeometry', () => {
      expect(deinterleaveGeometry).toBeDefined();
    });

    it('mergeGeometries', () => {
      expect(mergeGeometries).toBeDefined();
    });

    it('mergeAttributes', () => {
      expect(mergeAttributes).toBeDefined();
    });

    it('interleaveAttributes', () => {
      expect(interleaveAttributes).toBeDefined();
    });

    it('estimateBytesUsed', () => {
      expect(estimateBytesUsed).toBeDefined();
    });

    it('mergeVertices', () => {
      expect(mergeVertices).toBeDefined();
    });

    it('toTrianglesDrawMode', () => {
      expect(toTrianglesDrawMode).toBeDefined();
    });

    it('computeMorphedAttributes', () => {
      expect(computeMorphedAttributes).toBeDefined();
    });

    it('mergeGroups', () => {
      expect(mergeGroups).toBeDefined();
    });

    it('toCreasedNormals', () => {
      expect(toCreasedNormals).toBeDefined();
    });
  });
});
