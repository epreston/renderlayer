// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';

import { PerspectiveCamera } from '@renderlayer/cameras';
import { EventDispatcher } from '@renderlayer/core';

import { DragControls } from '../src/DragControls.js';

describe('Controls', () => {
  describe('DragControls', () => {
    const _mockDomElement = {
      style: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };

    // prettier-ignore
    const _near = 1, far = 3, aspect = 16 / 9, fov = 60;
    const _camera = new PerspectiveCamera(fov, aspect, _near, far);

    test('constructor', () => {
      const object = new DragControls([], _camera, _mockDomElement);
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new DragControls([], _camera, _mockDomElement);
      expect(object).toBeInstanceOf(EventDispatcher);
    });
  });
});
