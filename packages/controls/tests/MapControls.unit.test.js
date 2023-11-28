// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';

import { PerspectiveCamera } from '@renderlayer/cameras';
import { EventDispatcher } from '@renderlayer/core';
import { OrbitControls } from '../src/OrbitControls.js';

import { MapControls } from '../src/MapControls.js';

describe('Controls', () => {
  describe('MapControls', () => {
    const mockDomElement = {
      style: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };

    // prettier-ignore
    const near = 1, far = 3, aspect = 16 / 9, fov = 50;
    const camera = new PerspectiveCamera(fov, aspect, near, far);

    test('constructor', () => {
      const object = new MapControls(camera, mockDomElement);
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new MapControls(camera, mockDomElement);
      expect(object).toBeInstanceOf(OrbitControls);
      expect(object).toBeInstanceOf(EventDispatcher);
    });
  });
});
