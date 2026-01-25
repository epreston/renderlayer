// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';

import { PerspectiveCamera } from '@renderlayer/cameras';
import { EventDispatcher, Raycaster } from '@renderlayer/core';

import { DragControls } from '../src/DragControls.js';

describe('Controls', () => {
  describe('DragControls', () => {
    const _mockDomElement = {
      style: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      ownerDocument: {
        removeEventListener: vi.fn()
      }
    };

    // prettier-ignore
    const _near = 1, _far = 3, _aspect = 16 / 9, _fov = 60;
    const _camera = new PerspectiveCamera(_fov, _aspect, _near, _far);

    test('constructor', () => {
      const object = new DragControls([], _camera, _mockDomElement);
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new DragControls([], _camera, _mockDomElement);
      expect(object).toBeInstanceOf(EventDispatcher);
    });

    test('state', () => {
      const object = new DragControls([], _camera, _mockDomElement);
      expect(object.state).toBeDefined();
    });

    test('object', () => {
      const object = new DragControls([], _camera, _mockDomElement);
      expect(object.object).toBeDefined();
    });

    test('domElement', () => {
      const object = new DragControls([], _camera, _mockDomElement);
      expect(object.domElement).toBeDefined();
    });

    test('objects', () => {
      const object = new DragControls([], _camera, _mockDomElement);
      expect(object.objects).toBeDefined();
      expect(object.objects).toBeInstanceOf(Array);
    });

    test('enabled', () => {
      const object = new DragControls([], _camera, _mockDomElement);
      expect(object.enabled).toBeTruthy();
    });

    test('recursive', () => {
      const object = new DragControls([], _camera, _mockDomElement);
      expect(object.recursive).toBeTruthy();
    });

    test('transformGroup', () => {
      const object = new DragControls([], _camera, _mockDomElement);
      expect(object.transformGroup).toBeFalsy();
    });

    test('rotateSpeed', () => {
      const object = new DragControls([], _camera, _mockDomElement);
      expect(object.rotateSpeed).toBe(1);
    });

    test('raycaster', () => {
      const object = new DragControls([], _camera, _mockDomElement);
      expect(object.raycaster).toBeDefined();
      expect(object.raycaster).toBeInstanceOf(Raycaster);
    });

    test('connect', () => {
      const object = new DragControls([], _camera, _mockDomElement);
      expect(object.connect).toBeDefined();
      expect(object.connect).toBeInstanceOf(Function);
    });

    test('disconnect', () => {
      const object = new DragControls([], _camera, _mockDomElement);
      expect(object.disconnect).toBeDefined();
      expect(object.disconnect).toBeInstanceOf(Function);
    });

    test('dispose', () => {
      const object = new DragControls([], _camera, _mockDomElement);
      expect(object.dispose).toBeDefined();
      expect(object.dispose).toBeInstanceOf(Function);
    });
  });
});
