// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';

import { PerspectiveCamera } from '@renderlayer/cameras';

import { OrbitControls } from '../src/OrbitControls.js';
import { MapControls } from '../src/MapControls.js';

describe('Controls', () => {
  describe('MapControls', () => {
    const _mockDomElement = {
      style: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };

    // prettier-ignore
    const _near = 1, _far = 3, _aspect = 16 / 9, _fov = 50;
    const _camera = new PerspectiveCamera(_fov, _aspect, _near, _far);

    test('constructor', () => {
      const object = new MapControls(_camera, _mockDomElement);
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new MapControls(_camera, _mockDomElement);
      expect(object).toBeInstanceOf(OrbitControls);
    });

    test('screenSpacePanning', () => {
      const object = new MapControls(_camera, _mockDomElement);
      expect(object.screenSpacePanning).toBeFalsy(1);
    });

    test('mouseButtons', () => {
      const object = new MapControls(_camera, _mockDomElement);
      expect(object.mouseButtons).toBeInstanceOf(Object);
    });

    test('touches', () => {
      const object = new MapControls(_camera, _mockDomElement);
      expect(object.touches).toBeInstanceOf(Object);
    });
  });
});
