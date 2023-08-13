import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Object3D, Raycaster } from '@renderlayer/core';
import { BoxGeometry, PlaneGeometry } from '@renderlayer/geometries';
import { MeshBasicMaterial } from '@renderlayer/materials';
import { Vector2, Vector3 } from '@renderlayer/math';
import { DoubleSide } from '@renderlayer/shared';

import { Mesh } from '../src/Mesh.js';

describe('Objects', () => {
  describe('Mesh', () => {
    test('Extending', () => {
      const mesh = new Mesh();
      expect(mesh).toBeInstanceOf(Object3D);
    });

    test('Instancing', () => {
      const object = new Mesh();
      expect(object).toBeDefined();
    });

    test('type', () => {
      const object = new Mesh();
      expect(object.type === 'Mesh').toBeTruthy();
    });

    test.todo('geometry', () => {
      // implement
    });

    test.todo('material', () => {
      // implement
    });

    test('isMesh', () => {
      const object = new Mesh();
      expect(object.isMesh).toBeTruthy();
    });

    test('copy', () => {
      const src = new Mesh();
      const dst = new Mesh();

      dst.copy(src);

      expect(dst.geometry).toBe(src.geometry);
      expect(dst.material).toBe(src.material);
    });

    test.todo('updateMorphTargets', () => {
      // implement
    });

    test.todo('getVertexPosition', () => {
      // implement
    });

    test('raycast', () => {
      const geometry = new PlaneGeometry();
      const material = new MeshBasicMaterial();

      const mesh = new Mesh(geometry, material);

      const raycaster = new Raycaster();
      raycaster.ray.origin.set(0.25, 0.25, 1);
      raycaster.ray.direction.set(0, 0, -1);

      const intersections = [];

      mesh.raycast(raycaster, intersections);

      const intersection = intersections[0];

      expect(intersection.object).toBe(mesh);
      expect(intersection.distance).toBe(1);
      expect(intersection.faceIndex).toBe(0);

      expect(intersection.face).toEqual({
        a: 0,
        b: 2,
        c: 1,
        materialIndex: 0,
        normal: new Vector3(0, 0, 1)
      });
      expect(intersection.point).toEqual(new Vector3(0.25, 0.25, 0));
      expect(intersection.uv).toEqual(new Vector2(0.75, 0.75));
    });

    test('raycast/range', () => {
      const geometry = new BoxGeometry(1, 1, 1);
      const material = new MeshBasicMaterial({ side: DoubleSide });
      const mesh = new Mesh(geometry, material);
      const raycaster = new Raycaster();
      const intersections = [];

      raycaster.ray.origin.set(0, 0, 0);
      raycaster.ray.direction.set(1, 0, 0);
      raycaster.near = 100;
      raycaster.far = 200;

      mesh.matrixWorld.identity();
      mesh.position.setX(150);
      mesh.updateMatrixWorld(true);
      intersections.length = 0;
      mesh.raycast(raycaster, intersections);

      expect(intersections.length > 0).toBeTruthy();

      mesh.matrixWorld.identity();
      mesh.position.setX(raycaster.near);
      mesh.updateMatrixWorld(true);
      intersections.length = 0;
      mesh.raycast(raycaster, intersections);

      expect(intersections.length > 0).toBeTruthy();

      mesh.matrixWorld.identity();
      mesh.position.setX(raycaster.far);
      mesh.updateMatrixWorld(true);
      intersections.length = 0;
      mesh.raycast(raycaster, intersections);

      expect(intersections.length > 0).toBeTruthy();

      mesh.matrixWorld.identity();
      mesh.position.setX(150);
      mesh.scale.setY(9999);
      mesh.updateMatrixWorld(true);
      intersections.length = 0;
      mesh.raycast(raycaster, intersections);

      expect(intersections.length > 0).toBeTruthy();

      mesh.matrixWorld.identity();
      mesh.position.setX(-9999);
      mesh.updateMatrixWorld(true);
      intersections.length = 0;
      mesh.raycast(raycaster, intersections);

      expect(intersections.length === 0).toBeTruthy();

      mesh.matrixWorld.identity();
      mesh.position.setX(9999);
      mesh.updateMatrixWorld(true);
      intersections.length = 0;
      mesh.raycast(raycaster, intersections);

      expect(intersections.length === 0).toBeTruthy();
    });
  });
});
