import { describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import {
  LinearMipmapLinearFilter,
  WebGLCoordinateSystem,
  WebGPUCoordinateSystem
} from '@renderlayer/shared';
import { WebGLCubeRenderTarget } from '@renderlayer/targets';

import { WebGLRenderer } from '@renderlayer/renderers';
import { Scene } from '@renderlayer/scenes';

vi.mock('@renderlayer/renderers', () => {
  const WebGLRenderer = vi.fn();
  WebGLRenderer.prototype.coordinateSystem = WebGLCoordinateSystem;
  WebGLRenderer.prototype.getActiveCubeFace = vi.fn();
  WebGLRenderer.prototype.getActiveMipmapLevel = vi.fn();
  WebGLRenderer.prototype.getRenderTarget = vi.fn();
  WebGLRenderer.prototype.setRenderTarget = vi.fn();
  WebGLRenderer.prototype.render = vi.fn();
  return { WebGLRenderer };
});

vi.mock('@renderlayer/scenes');

import { CubeCamera } from '../src/CubeCamera.js';

describe('Cameras', () => {
  describe('CubeCamera', () => {
    test('constructor', () => {
      const object = new CubeCamera();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new CubeCamera();
      expect(object).toBeInstanceOf(Object3D);
    });

    test('type', () => {
      const object = new CubeCamera();
      expect(object.type).toBe('CubeCamera');
    });

    test('renderTarget', () => {
      // prettier-ignore
      const options = { generateMipmaps: true, minFilter: LinearMipmapLinearFilter };
      const renderTarget = new WebGLCubeRenderTarget(128, options);
      const near = 1;
      const far = 3;

      const object = new CubeCamera(near, far, renderTarget);

      expect(object.renderTarget).toBe(renderTarget);
    });

    test('coordinateSystem', () => {
      const object = new CubeCamera();
      expect(object.coordinateSystem).toBeNull();
    });

    test.todo('updateCoordinateSystem', () => {
      const object = new CubeCamera();
      expect(object.updateCoordinateSystem).toBeDefined();

      // EP: tests required
    });

    test('update', () => {
      // prettier-ignore
      const options = { generateMipmaps: true, minFilter: LinearMipmapLinearFilter };
      const renderTarget = new WebGLCubeRenderTarget(128, options);
      const near = 1;
      const far = 3;

      const object = new CubeCamera(near, far, renderTarget);

      // mocks
      const renderer = new WebGLRenderer();
      const scene = new Scene();

      object.update(renderer, scene);

      // mock render all 6 faces
      expect(renderer.render).toBeCalledTimes(6);
    });
  });
});
