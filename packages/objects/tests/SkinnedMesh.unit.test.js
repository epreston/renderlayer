import { describe, expect, it, test, vi } from 'vitest';

import { Object3D, Raycaster } from '@renderlayer/core';
import { ObjectLoader } from '@renderlayer/loaders';
import { Matrix4, Vector3 } from '@renderlayer/math';
import { AttachedBindMode } from '@renderlayer/shared';

import { skinnedMeshFactory } from './skinnedMeshHelpers.js';

import { Mesh } from '../src/Mesh.js';
import { Skeleton } from '../src/Skeleton.js';
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

    test('isSkinnedMesh', () => {
      const object = new SkinnedMesh();
      expect(object.isSkinnedMesh).toBeTruthy();
    });

    test('type', () => {
      const object = new SkinnedMesh();
      expect(object.type).toBe('SkinnedMesh');
    });

    test('bindMode', () => {
      const object = new SkinnedMesh();
      expect(object.bindMode).toBe(AttachedBindMode);
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

    test('skeleton', () => {
      const object = new SkinnedMesh();
      expect(object.skeleton).toBeNull();
    });

    test('boundingBox', () => {
      const object = new SkinnedMesh();
      expect(object.boundingBox).toBeNull();
    });

    test('boundingSphere', () => {
      const object = new SkinnedMesh();
      expect(object.boundingSphere).toBeNull();
    });

    test('computeBoundingBox', () => {
      const { mesh } = skinnedMeshFactory();

      expect(mesh.boundingBox).toBeNull();

      mesh.computeBoundingBox();

      expect(mesh.boundingBox).toBeDefined();
      expect(mesh.boundingBox).toMatchInlineSnapshot(`
        Box3 {
          "max": Vector3 {
            "x": 5,
            "y": 16,
            "z": 5,
          },
          "min": Vector3 {
            "x": -5,
            "y": -16,
            "z": -5,
          },
        }
      `);
    });

    test('computeBoundingSphere', () => {
      const { mesh } = skinnedMeshFactory();

      expect(mesh.boundingSphere).toBeNull();

      mesh.computeBoundingSphere();

      expect(mesh.boundingSphere).toBeDefined();
      expect(mesh.boundingSphere).toMatchInlineSnapshot(`
        {
          "center": [
            0.6982977624676568,
            3.5662052113218454,
            1.3585288233260149,
          ],
          "radius": 20.60857993529236,
        }
      `);
    });

    test('copy', () => {
      const src = new SkinnedMesh();
      const dst = new SkinnedMesh();

      dst.copy(src);

      expect(dst.bindMode).toBe(src.bindMode);
      expect(dst.bindMatrix.equals(src.bindMatrix)).toBeTruthy();
      expect(dst.bindMatrixInverse.equals(src.bindMatrixInverse)).toBeTruthy();
      expect(dst.skeleton).toBe(src.skeleton);

      expect(dst).not.toBe(src);
    });

    test('raycast', () => {
      const { mesh } = skinnedMeshFactory();

      const raycaster = new Raycaster();
      const intersects = [];

      mesh.raycast(raycaster, intersects);

      expect(intersects.length).toBe(0);
    });

    test('bind', () => {
      const { mesh, bones } = skinnedMeshFactory();
      const skeleton = new Skeleton(bones);

      mesh.add(bones[0]);
      mesh.bind(skeleton);

      expect(mesh.skeleton).toBe(skeleton);
    });

    test('pose', () => {
      const { mesh } = skinnedMeshFactory();
      mesh.pose();

      // assets required
    });

    test('normalizeSkinWeights', () => {
      const { mesh } = skinnedMeshFactory();
      mesh.normalizeSkinWeights();

      // assets required
    });

    test('updateMatrixWorld', () => {
      const { mesh } = skinnedMeshFactory();
      mesh.bindMode = 'detached';

      mesh.updateMatrixWorld();

      // assets required
    });

    test('applyBoneTransform', () => {
      const { mesh, geometry } = skinnedMeshFactory();
      const positionAttribute = geometry.getAttribute('position');
      const vertex = new Vector3().fromBufferAttribute(positionAttribute, 3);

      mesh.applyBoneTransform(3, vertex);

      expect(vertex).toMatchInlineSnapshot(`
        Vector3 {
          "x": 3.535533905029297,
          "y": 16,
          "z": -3.535533905029297,
        }
      `);
    });

    test('from ObjectLoader', () => {
      // prettier-ignore
      const { mesh } = skinnedMeshFactory();
      const json = mesh.toJSON();
      const loader = new ObjectLoader();
      const outputObject = loader.parse(json);

      // other comparisons fail
      expect(outputObject.toJSON()).toStrictEqual(mesh.toJSON());
    });
  });
});
