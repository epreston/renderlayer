import { describe, expect, it, test, vi } from 'vitest';

import { Matrix4 } from '@renderlayer/math';
import { Object3D } from '@renderlayer/core';
import { Mesh } from '../src/Mesh.js';
import { SkinnedMesh } from '../src/SkinnedMesh.js';

describe('Objects', () => {
  describe('SkinnedMesh', () => {
    test('constructor', () => {
      const object = new SkinnedMesh();
      expect(object).toBeDefined();
    });

    test('extends', () => {
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

    test('bindMatrix', () => {
      const object = new SkinnedMesh();
      const bindMatrix = object.bindMatrix;

      expect(bindMatrix).toBeInstanceOf(Matrix4);
      expect(bindMatrix.equals(new Matrix4().identity())).toBeTruthy();
    });

    test('bindMatrixInverse', () => {
      const object = new SkinnedMesh();
      const bindMatrixInverse = object.bindMatrixInverse;

      expect(bindMatrixInverse).toBeInstanceOf(Matrix4);
      expect(bindMatrixInverse.equals(new Matrix4().identity())).toBeTruthy();
    });

    test('isSkinnedMesh', () => {
      const object = new SkinnedMesh();
      expect(object.isSkinnedMesh).toBeTruthy();
    });

    test('copy', () => {
      const src = new SkinnedMesh();
      const dst = new SkinnedMesh();

      dst.copy(src);

      expect(dst.bindMode).toBe(src.bindMode);
      expect(dst.bindMatrix.equals(src.bindMatrix)).toBeTruthy();
      expect(dst.bindMatrixInverse.equals(src.bindMatrixInverse)).toBeTruthy();

      expect(dst.skeleton).toBe(src.skeleton);
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
