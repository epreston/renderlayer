import { describe, expect, it, test, vi } from 'vitest';

import { Vector4 } from '@renderlayer/math';
import { Texture } from '@renderlayer/textures';

import { EventDispatcher } from '@renderlayer/core';
import { RenderTarget } from '../src/RenderTarget.js';

describe('Targets', () => {
  describe('RenderTarget', () => {
    test('constructor', () => {
      const object = new RenderTarget();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new RenderTarget();
      expect(object).toBeInstanceOf(EventDispatcher);
    });

    test('isRenderTarget', () => {
      const object = new RenderTarget();
      expect(object.isRenderTarget).toBeTruthy();
    });

    test('width', () => {
      const object = new RenderTarget(64, 64);
      expect(object.width).toBe(64);
    });

    test('height', () => {
      const object = new RenderTarget(32, 32);
      expect(object.height).toBe(32);
    });

    test('depth', () => {
      const object = new RenderTarget();
      expect(object.depth).toBe(1);
    });

    test('scissor', () => {
      const object = new RenderTarget();
      expect(object.scissor).toBeInstanceOf(Vector4);
    });

    test('scissorTest', () => {
      const object = new RenderTarget();
      expect(object.scissorTest).toBe(false);
    });

    test('viewport', () => {
      const object = new RenderTarget();
      expect(object.viewport).toBeInstanceOf(Vector4);
    });

    test('texture', () => {
      const object = new RenderTarget();
      expect(object.texture).toBeInstanceOf(Texture);
      expect(object.texture.isRenderTargetTexture).toBeTruthy();
      expect(object.texture.flipY).toBe(false);
    });

    test('depthBuffer', () => {
      const object = new RenderTarget();
      expect(object.depthBuffer).toBe(true);
    });

    test('stencilBuffer', () => {
      const object = new RenderTarget();
      expect(object.stencilBuffer).toBe(false);
    });

    test('depthTexture', () => {
      const object = new RenderTarget();
      expect(object.depthTexture).toBeNull();
    });

    test('samples', () => {
      const object = new RenderTarget();
      expect(object.samples).toBe(0);
    });

    test('setSize', () => {
      const object = new RenderTarget(32, 32);

      object.setSize(64, 64);

      expect(object.width).toBe(64);
      expect(object.height).toBe(64);
    });

    test('clone', () => {
      const object = new RenderTarget();
      const clonedObject = object.clone();

      // will be different
      clonedObject.texture.uuid = object.texture.uuid;
      clonedObject.texture.source = object.texture.source;
      clonedObject.texture.version = object.texture.version;

      expect(clonedObject).not.toBe(object);
      expect(clonedObject).toStrictEqual(object);
    });

    test('copy', () => {
      const object = new RenderTarget(32, 32);
      const copiedObject = new RenderTarget(64, 64);

      copiedObject.copy(object);

      // will be different
      copiedObject.texture.uuid = object.texture.uuid;
      copiedObject.texture.source = object.texture.source;
      copiedObject.texture.version = object.texture.version;

      expect(copiedObject).not.toBe(object);
      expect(copiedObject).toStrictEqual(object);
    });

    test('dispose', () => {
      const object = new RenderTarget();
      object.dispose();

      expect(object).toBeDefined();
    });
  });
});
