import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { Mesh } from '../src/Mesh.js';
import { SkinnedMesh } from '../src/SkinnedMesh.js';

describe('Objects', () => {
  describe('SkinnedMesh', () => {
    test('Instancing', () => {
      const object = new SkinnedMesh();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const skinnedMesh = new SkinnedMesh();

      expect(skinnedMesh).toBeInstanceOf(Object3D);
      expect(skinnedMesh).toBeInstanceOf(Mesh);
    });

    test('type', () => {
      const object = new SkinnedMesh();
      expect(object.type).toBe('SkinnedMesh');
    });

    test('bindMode', () => {
      const object = new SkinnedMesh();
      expect(object.bindMode).toBe('attached');
    });

    test.todo('bindMatrix', () => {
      // implement
    });

    test.todo('bindMatrixInverse', () => {
      // implement
    });

    test('isSkinnedMesh', () => {
      const object = new SkinnedMesh();
      expect(object.isSkinnedMesh).toBeTruthy();
    });

    test.todo('copy', () => {
      // implement
    });

    test.todo('bind', () => {
      // implement
    });

    test.todo('pose', () => {
      // implement
    });

    test.todo('normalizeSkinWeights', () => {
      // implement
    });

    test.todo('updateMatrixWorld', () => {
      // implement
    });

    test.todo('applyBoneTransform', () => {
      // implement
    });
  });
});
