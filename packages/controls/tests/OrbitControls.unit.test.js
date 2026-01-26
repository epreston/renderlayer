// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';

import { PerspectiveCamera } from '@renderlayer/cameras';
import { EventDispatcher } from '@renderlayer/core';

import { OrbitControls } from '../src/OrbitControls.js';

describe('Controls', () => {
  describe('OrbitControls', () => {
    const _mockDomElement = {
      style: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      ownerDocument: {
        removeEventListener: vi.fn()
      },
      getRootNode: () => ({
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      })
    };

    // prettier-ignore
    const _near = 1, _far = 3, _aspect = 16 / 9, _fov = 60;
    const _camera = new PerspectiveCamera(_fov, _aspect, _near, _far);

    test('constructor', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object).toBeInstanceOf(EventDispatcher);
    });

    test('object', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.object).toBeDefined();
    });

    test('domElement', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.domElement).toBeDefined();
    });

    test('enabled', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.enabled).toBeTruthy();
    });

    test('target', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.target).toBeDefined();
    });

    test('cursor', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.cursor).toBeDefined();
    });

    test('minDistance', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.minDistance).toBe(0);
    });

    test('maxDistance', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.maxDistance).toBe(Infinity);
    });

    test('minZoom', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.minZoom).toBe(0);
    });

    test('maxZoom', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.maxZoom).toBe(Infinity);
    });

    test('minTargetRadius', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.minTargetRadius).toBe(0);
    });

    test('maxTargetRadius', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.maxTargetRadius).toBe(Infinity);
    });

    test('minPolarAngle', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.minPolarAngle).toBe(0);
    });

    test('maxPolarAngle', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.maxPolarAngle).toBe(Math.PI);
    });

    test('minAzimuthAngle', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.minAzimuthAngle).toBe(-Infinity);
    });

    test('maxAzimuthAngle', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.maxAzimuthAngle).toBe(Infinity);
    });

    test('enableDamping', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.enableDamping).toBeFalsy();
    });

    test('dampingFactor', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.dampingFactor).toBeCloseTo(0.05);
    });

    test('enableZoom', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.enableZoom).toBeTruthy();
    });

    test('zoomSpeed', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.zoomSpeed).toBeCloseTo(1.0);
    });

    test('enableRotate', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.enableRotate).toBeTruthy();
    });

    test('rotateSpeed', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.rotateSpeed).toBeCloseTo(1.0);
    });

    test('keyRotateSpeed', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.keyRotateSpeed).toBeCloseTo(1.0);
    });

    test('enablePan', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.enablePan).toBeTruthy();
    });

    test('panSpeed', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.panSpeed).toBeCloseTo(1.0);
    });

    test('screenSpacePanning', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.screenSpacePanning).toBeTruthy();
    });

    test('keyPanSpeed', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.keyPanSpeed).toBeCloseTo(7.0);
    });

    test('zoomToCursor', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.zoomToCursor).toBeFalsy();
    });

    test('autoRotate', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.autoRotate).toBeFalsy();
    });

    test('autoRotateSpeed', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.autoRotateSpeed).toBeCloseTo(2.0);
    });

    test('keys', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.keys).toBeDefined();
    });

    test('mouseButtons', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.mouseButtons).toBeDefined();
    });

    test('touches', () => {
      const object = new OrbitControls(_camera, _mockDomElement);
      expect(object.touches).toBeDefined();
    });
  });
});
