import { describe, expect, it, test, vi } from 'vitest';

import { Vector4 } from '@renderlayer/math';
import { Texture } from '@renderlayer/textures';

import { EventDispatcher } from '@renderlayer/core';
import { WebGLRenderTarget } from '../src/WebGLRenderTarget.js';

describe('Renderers', () => {
  describe('WebGLRenderTarget', () => {
    test('constructor', () => {
      const object = new WebGLRenderTarget();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new WebGLRenderTarget();
      expect(object).toBeInstanceOf(EventDispatcher);
    });

    test('isWebGLRenderTarget', () => {
      const object = new WebGLRenderTarget();
      expect(object.isWebGLRenderTarget).toBeTruthy();
    });

    test('width', () => {
      const object = new WebGLRenderTarget(64, 64);
      expect(object.width).toBe(64);
    });

    test('height', () => {
      const object = new WebGLRenderTarget(32, 32);
      expect(object.height).toBe(32);
    });

    test('depth', () => {
      const object = new WebGLRenderTarget();
      expect(object.depth).toBe(1);
    });

    test('scissor', () => {
      const object = new WebGLRenderTarget();
      expect(object.scissor).toBeInstanceOf(Vector4);
    });

    test('scissorTest', () => {
      const object = new WebGLRenderTarget();
      expect(object.scissorTest).toBe(false);
    });

    test('viewport', () => {
      const object = new WebGLRenderTarget();
      expect(object.viewport).toBeInstanceOf(Vector4);
    });

    test('texture', () => {
      const object = new WebGLRenderTarget();
      expect(object.texture).toBeInstanceOf(Texture);
      expect(object.texture.isRenderTargetTexture).toBeTruthy();
      expect(object.texture.flipY).toBe(false);
    });

    test('depthBuffer', () => {
      const object = new WebGLRenderTarget();
      expect(object.depthBuffer).toBe(true);
    });

    test('stencilBuffer', () => {
      const object = new WebGLRenderTarget();
      expect(object.stencilBuffer).toBe(false);
    });

    test('depthTexture', () => {
      const object = new WebGLRenderTarget();
      expect(object.depthTexture).toBeNull();
    });

    test('samples', () => {
      const object = new WebGLRenderTarget();
      expect(object.samples).toBe(0);
    });

    test('setSize', () => {
      const object = new WebGLRenderTarget(32, 32);

      object.setSize(64, 64);

      expect(object.width).toBe(64);
      expect(object.height).toBe(64);
    });

    test('clone', () => {
      const object = new WebGLRenderTarget();
      const clonedObject = object.clone();

      // will be different
      clonedObject.texture.uuid = object.texture.uuid;
      clonedObject.texture.source = object.texture.source;
      clonedObject.texture.version = object.texture.version;

      expect(clonedObject).not.toBe(object);
      expect(clonedObject).toStrictEqual(object);
    });

    test('copy', () => {
      const object = new WebGLRenderTarget(32, 32);
      const copiedObject = new WebGLRenderTarget(64, 64);

      copiedObject.copy(object);

      // will be different
      copiedObject.texture.uuid = object.texture.uuid;
      copiedObject.texture.source = object.texture.source;
      copiedObject.texture.version = object.texture.version;

      expect(copiedObject).not.toBe(object);
      expect(copiedObject).toStrictEqual(object);
    });

    test('dispose', () => {
      const object = new WebGLRenderTarget();
      object.dispose();

      expect(object).toBeDefined();
    });
  });
});
