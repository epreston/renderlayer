import { describe, expect, it, test, vi } from 'vitest';

import { Scene } from '@renderlayer/scenes';
import { WebGLRenderList, WebGLRenderLists } from '../src/WebGLRenderLists.js';

describe('WebGL', () => {
  describe('WebGLRenderLists', () => {
    it('should expose a function', () => {
      expect(WebGLRenderLists).toBeDefined();
    });

    test('get', () => {
      const renderLists = new WebGLRenderLists();
      const sceneA = new Scene();
      const sceneB = new Scene();

      const listA = renderLists.get(sceneA);
      const listB = renderLists.get(sceneB);

      expect(Object.keys(listA)).toEqual(Object.keys(new WebGLRenderList()));
      expect(Object.keys(listB)).toEqual(Object.keys(new WebGLRenderList()));
      expect(listA !== listB).toBeTruthy();
    });

    test.todo('dispose', () => {
      // implement
    });
  });

  describe('WebGLRenderList', () => {
    it('should expose a function', () => {
      expect(WebGLRenderList).toBeDefined();
    });

    test.todo('opaque', () => {
      // implement
    });

    test.todo('transmissive', () => {
      // implement
    });

    test.todo('transparent', () => {
      // implement
    });

    test('init', () => {
      const list = new WebGLRenderList();

      expect(list.transparent.length === 0).toBeTruthy();
      expect(list.opaque.length === 0).toBeTruthy();

      list.push({}, {}, { transparent: true }, 0, 0, {});
      list.push({}, {}, { transparent: false }, 0, 0, {});

      expect(list.transparent.length === 1).toBeTruthy();
      expect(list.opaque.length === 1).toBeTruthy();

      list.init();

      expect(list.transparent.length === 0).toBeTruthy();
      expect(list.opaque.length === 0).toBeTruthy();
    });

    test('push', () => {
      const list = new WebGLRenderList();
      const objA = { id: 'A', renderOrder: 0 };
      const matA = { transparent: true };
      const geoA = {};

      const objB = { id: 'B', renderOrder: 0 };
      const matB = { transparent: true };
      const geoB = {};

      const objC = { id: 'C', renderOrder: 0 };
      const matC = { transparent: false };
      const geoC = {};

      const objD = { id: 'D', renderOrder: 0 };
      const matD = { transparent: false };
      const geoD = {};

      list.push(objA, geoA, matA, 0, 0.5, {});

      expect(list.transparent.length === 1).toBeTruthy();
      expect(list.opaque.length === 0).toBeTruthy();
      expect(list.transparent[0]).toEqual({
        id: 'A',
        object: objA,
        geometry: geoA,
        material: matA,
        groupOrder: 0,
        renderOrder: 0,
        z: 0.5,
        group: {}
      });

      list.push(objB, geoB, matB, 1, 1.5, {});

      expect(list.transparent.length === 2).toBeTruthy();
      expect(list.opaque.length === 0).toBeTruthy();
      expect(list.transparent[1]).toEqual({
        id: 'B',
        object: objB,
        geometry: geoB,
        material: matB,
        groupOrder: 1,
        renderOrder: 0,
        z: 1.5,
        group: {}
      });

      list.push(objC, geoC, matC, 2, 2.5, {});

      expect(list.transparent.length === 2).toBeTruthy();
      expect(list.opaque.length === 1).toBeTruthy();
      expect(list.opaque[0]).toEqual({
        id: 'C',
        object: objC,
        geometry: geoC,
        material: matC,
        groupOrder: 2,
        renderOrder: 0,
        z: 2.5,
        group: {}
      });

      list.push(objD, geoD, matD, 3, 3.5, {});

      expect(list.transparent.length === 2).toBeTruthy();
      expect(list.opaque.length === 2).toBeTruthy();
      expect(list.opaque[1]).toEqual({
        id: 'D',
        object: objD,
        geometry: geoD,
        material: matD,
        groupOrder: 3,
        renderOrder: 0,
        z: 3.5,
        group: {}
      });
    });

    test('unshift', () => {
      const list = new WebGLRenderList();
      const objA = { id: 'A', renderOrder: 0 };
      const matA = { transparent: true };
      const geoA = {};

      const objB = { id: 'B', renderOrder: 0 };
      const matB = { transparent: true };
      const geoB = {};

      const objC = { id: 'C', renderOrder: 0 };
      const matC = { transparent: false };
      const geoC = {};

      const objD = { id: 'D', renderOrder: 0 };
      const matD = { transparent: false };
      const geoD = {};

      list.unshift(objA, geoA, matA, 0, 0.5, {});

      expect(list.transparent.length === 1).toBeTruthy();
      expect(list.opaque.length === 0).toBeTruthy();
      expect(list.transparent[0]).toEqual({
        id: 'A',
        object: objA,
        geometry: geoA,
        material: matA,
        groupOrder: 0,
        renderOrder: 0,
        z: 0.5,
        group: {}
      });

      list.unshift(objB, geoB, matB, 1, 1.5, {});

      expect(list.transparent.length === 2).toBeTruthy();
      expect(list.opaque.length === 0).toBeTruthy();
      expect(list.transparent[0]).toEqual({
        id: 'B',
        object: objB,
        geometry: geoB,
        material: matB,
        groupOrder: 1,
        renderOrder: 0,
        z: 1.5,
        group: {}
      });

      list.unshift(objC, geoC, matC, 2, 2.5, {});

      expect(list.transparent.length === 2).toBeTruthy();
      expect(list.opaque.length === 1).toBeTruthy();
      expect(list.opaque[0]).toEqual({
        id: 'C',
        object: objC,
        geometry: geoC,
        material: matC,
        groupOrder: 2,
        renderOrder: 0,
        z: 2.5,
        group: {}
      });

      list.unshift(objD, geoD, matD, 3, 3.5, {});

      expect(list.transparent.length === 2).toBeTruthy();
      expect(list.opaque.length === 2).toBeTruthy();
      expect(list.opaque[0]).toEqual({
        id: 'D',
        object: objD,
        geometry: geoD,
        material: matD,
        groupOrder: 3,
        renderOrder: 0,
        z: 3.5,
        group: {}
      });
    });

    test.todo('finish', () => {
      // implement
    });

    test('sort', () => {
      const list = new WebGLRenderList();
      const items = [{ id: 4 }, { id: 5 }, { id: 2 }, { id: 3 }];

      items.forEach((item) => {
        list.push(item, {}, { transparent: true }, 0, 0, {});
        list.push(item, {}, { transparent: false }, 0, 0, {});
      });

      list.sort(
        (a, b) => a.id - b.id,
        (a, b) => b.id - a.id
      );

      expect(list.opaque.map((item) => item.id)).toEqual([2, 3, 4, 5]);

      expect(list.transparent.map((item) => item.id)).toEqual([5, 4, 3, 2]);
    });
  });
});
