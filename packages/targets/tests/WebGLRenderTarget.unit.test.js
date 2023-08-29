import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

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

    test.todo('width', () => {
      // implement
    });

    test.todo('height', () => {
      // implement
    });

    test.todo('depth', () => {
      // implement
    });

    test.todo('scissor', () => {
      // implement
    });

    test.todo('scissorTest', () => {
      // implement
    });

    test.todo('viewport', () => {
      // implement
    });

    test.todo('texture', () => {
      // implement
    });

    test.todo('depthBuffer', () => {
      // implement
    });

    test.todo('stencilBuffer', () => {
      // implement
    });

    test.todo('depthTexture', () => {
      // implement
    });

    test.todo('samples', () => {
      // implement
    });

    test.todo('isWebGLRenderTarget', () => {
      // implement
    });

    test.todo('setSize', () => {
      // implement
    });

    test.todo('clone', () => {
      // implement
    });

    test.todo('copy', () => {
      // implement
    });

    test('dispose', () => {
      const object = new WebGLRenderTarget();
      object.dispose();

      expect(object).toBeDefined();
    });
  });
});
