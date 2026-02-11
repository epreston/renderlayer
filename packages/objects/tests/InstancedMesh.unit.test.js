import { describe, expect, it, test, vi } from 'vitest';

import { InstancedBufferAttribute } from '@renderlayer/buffers';
import { Raycaster } from '@renderlayer/core';
import { BoxGeometry } from '@renderlayer/geometries';
import { ObjectLoader } from '@renderlayer/loaders';
import { MeshBasicMaterial } from '@renderlayer/materials';
import { Color, Matrix4 } from '@renderlayer/math';

import { InstancedMesh } from '../src/InstancedMesh.js';
import { Mesh } from '../src/Mesh.js';

describe('Objects', () => {
  describe('InstancedMesh', () => {
    test('constructor', () => {
      const object = new InstancedMesh();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new InstancedMesh();
      expect(object).toBeInstanceOf(Mesh);
    });

    test('isInstancedMesh', () => {
      const object = new InstancedMesh();
      expect(object.isInstancedMesh).toBeTruthy();
    });

    test('instanceMatrix', () => {
      const object = new InstancedMesh();
      const instanceMatrix = object.instanceMatrix;
      expect(instanceMatrix).toBeInstanceOf(InstancedBufferAttribute);
    });

    test('instanceColor', () => {
      const object = new InstancedMesh();
      expect(object.instanceColor).toBeNull();
    });

    test('count', () => {
      const geometry = new BoxGeometry();
      const material = new MeshBasicMaterial();
      const object = new InstancedMesh(geometry, material, 3);

      expect(object.count).toBe(3);
    });

    test('boundingBox', () => {
      const object = new InstancedMesh();
      expect(object.boundingBox).toBeNull();
    });

    test('boundingSphere', () => {
      const object = new InstancedMesh();
      expect(object.boundingSphere).toBeNull();
    });

    test('computeBoundingBox', () => {
      const geometry = new BoxGeometry();
      const material = new MeshBasicMaterial();
      const object = new InstancedMesh(geometry, material, 3);

      expect(object.boundingBox).toBeNull();

      object.computeBoundingBox();

      expect(object.boundingBox).toBeDefined();
      expect(object.boundingBox).toMatchInlineSnapshot(`
        {
          "max": [
            0.5,
            0.5,
            0.5,
          ],
          "min": [
            -0.5,
            -0.5,
            -0.5,
          ],
        }
      `);
    });

    test('computeBoundingSphere', () => {
      const geometry = new BoxGeometry();
      const material = new MeshBasicMaterial();
      const object = new InstancedMesh(geometry, material, 3);

      expect(object.boundingSphere).toBeNull();

      object.computeBoundingSphere();

      expect(object.boundingSphere).toBeDefined();
      expect(object.boundingSphere).toMatchInlineSnapshot(`
        {
          "center": [
            0,
            0,
            0,
          ],
          "radius": 0.8660254037844386,
        }
      `);
    });

    test('copy', () => {
      const geometry = new BoxGeometry();
      const material = new MeshBasicMaterial();
      const object = new InstancedMesh(geometry, material, 3);
      const copiedObject = new InstancedMesh();

      copiedObject.copy(object);

      // will be different
      copiedObject.uuid = object.uuid;

      expect(copiedObject).not.toBe(object);
      expect(copiedObject).toStrictEqual(object);
    });

    test('setColorAt', () => {
      const geometry = new BoxGeometry();
      const material = new MeshBasicMaterial();
      const object = new InstancedMesh(geometry, material, 3);
      const white = new Color().setHex(0xffffff);

      for (let x = 0; x < object.count; x++) {
        object.setColorAt(x, white);
      }

      expect(object.instanceColor).not.toBeNull();
      expect(object.instanceColor).toBeInstanceOf(InstancedBufferAttribute);
    });

    test('getColorAt', () => {
      const geometry = new BoxGeometry();
      const material = new MeshBasicMaterial();
      const object = new InstancedMesh(geometry, material, 3);
      const white = new Color().setHex(0xffffff);

      for (let x = 0; x < object.count; x++) {
        object.setColorAt(x, white);
      }

      const color = new Color();
      object.getColorAt(2, color);

      expect(color.equals(white)).toBeTruthy();
    });

    test('setMatrixAt', () => {
      const geometry = new BoxGeometry();
      const material = new MeshBasicMaterial();
      const object = new InstancedMesh(geometry, material, 3);
      const matrix = new Matrix4();
      matrix.setPosition(0, 0, -1);

      for (let x = 0; x < object.count; x++) {
        object.setMatrixAt(x, matrix);
      }

      expect(object.instanceMatrix).toBeInstanceOf(InstancedBufferAttribute);
    });

    test('getMatrixAt', () => {
      const geometry = new BoxGeometry();
      const material = new MeshBasicMaterial();
      const object = new InstancedMesh(geometry, material, 3);
      const matrix = new Matrix4();
      matrix.setPosition(0, 0, -1);

      for (let x = 0; x < object.count; x++) {
        object.setMatrixAt(x, matrix);
      }

      const instanceMatrix = new Matrix4();
      object.getMatrixAt(2, instanceMatrix);

      expect(instanceMatrix.equals(matrix)).toBeTruthy();
    });

    test('raycast', () => {
      const geometry = new BoxGeometry();
      const material = new MeshBasicMaterial();
      const object = new InstancedMesh(geometry, material, 3);
      const matrix = new Matrix4();
      matrix.setPosition(0, 0, -1);

      for (let x = 0; x < object.count; x++) {
        object.setMatrixAt(x, matrix);
      }

      const raycaster = new Raycaster();
      const intersects = [];

      object.raycast(raycaster, intersects);

      expect(intersects.length).toBe(6);
    });

    test('updateMorphTargets', () => {
      // signature defined, no implementation
      const object = new InstancedMesh();
      expect(object.updateMorphTargets).toBeDefined();
    });

    test('dispose', () => {
      const object = new InstancedMesh();
      object.dispose();

      expect(object).toBeDefined();
    });

    test('from ObjectLoader', () => {
      const geometry = new BoxGeometry();
      const material = new MeshBasicMaterial();
      const object = new InstancedMesh(geometry, material, 3);

      const json = object.toJSON();
      const loader = new ObjectLoader();
      const outputObject = loader.parse(json);

      expect(outputObject).toStrictEqual(object);
    });
  });
});
