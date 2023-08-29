import { describe, expect, it, test, vi } from 'vitest';

import { EventDispatcher } from '@renderlayer/core';
import { Material } from '../src/Material.js';

describe('Materials', () => {
  describe('Material', () => {
    test('constructor', () => {
      const object = new Material();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new Material();
      expect(object).toBeInstanceOf(EventDispatcher);
    });

    test.todo('id', () => {
      // implement
    });

    test('uuid', () => {
      const object = new Material();

      expect(object.uuid).to.be.a('string');
      expect(object.uuid).to.have.length(36);
    });

    test.todo('name', () => {
      // implement
    });

    test('isMaterial', () => {
      const object = new Material();
      expect(object.isMaterial).toBeTruthy();
    });

    test('type', () => {
      const object = new Material();
      expect(object.type === 'Material').toBeTruthy();
    });

    test.todo('blending', () => {
      // implement
    });

    test.todo('side', () => {
      // implement
    });

    test.todo('vertexColors', () => {
      // implement
    });

    test.todo('opacity', () => {
      // implement
    });

    test.todo('transparent', () => {
      // implement
    });

    test.todo('blendSrc', () => {
      // implement
    });

    test.todo('blendDst', () => {
      // implement
    });

    test.todo('blendEquation', () => {
      // implement
    });

    test.todo('blendSrcAlpha', () => {
      // implement
    });

    test.todo('blendDstAlpha', () => {
      // implement
    });

    test.todo('blendEquationAlpha', () => {
      // implement
    });

    test.todo('depthFunc', () => {
      // implement
    });

    test.todo('depthTest', () => {
      // implement
    });

    test.todo('depthWrite', () => {
      // implement
    });

    test.todo('stencilWriteMask', () => {
      // implement
    });

    test.todo('stencilFunc', () => {
      // implement
    });

    test.todo('stencilRef', () => {
      // implement
    });

    test.todo('stencilFuncMask', () => {
      // implement
    });

    test.todo('stencilFail', () => {
      // implement
    });

    test.todo('stencilZFail', () => {
      // implement
    });

    test.todo('stencilZPass', () => {
      // implement
    });

    test.todo('stencilWrite', () => {
      // implement
    });

    test.todo('clippingPlanes', () => {
      // implement
    });

    test.todo('clipIntersection', () => {
      // implement
    });

    test.todo('clipShadows', () => {
      // implement
    });

    test.todo('shadowSide', () => {
      // implement
    });

    test.todo('colorWrite', () => {
      // implement
    });

    test.todo('precision', () => {
      // implement
    });

    test.todo('polygonOffset', () => {
      // implement
    });

    test.todo('polygonOffsetFactor', () => {
      // implement
    });

    test.todo('polygonOffsetUnits', () => {
      // implement
    });

    test.todo('dithering', () => {
      // implement
    });

    test.todo('alphaToCoverage', () => {
      // implement
    });

    test.todo('premultipliedAlpha', () => {
      // implement
    });

    test.todo('forceSinglePass', () => {
      // implement
    });

    test.todo('visible', () => {
      // implement
    });

    test.todo('toneMapped', () => {
      // implement
    });

    test.todo('userData', () => {
      // implement
    });

    test.todo('alphaTest', () => {
      // implement
    });

    test.todo('needsUpdate', () => {
      // set needsUpdate
      // implement
    });

    test.todo('onBuild', () => {
      // implement
    });

    test.todo('onBeforeRender', () => {
      // implement
    });

    test.todo('onBeforeCompile', () => {
      // implement
    });

    test.todo('customProgramCacheKey', () => {
      // implement
    });

    test.todo('setValues', () => {
      // implement
    });

    test.todo('toJSON', () => {
      // implement
    });

    test.todo('clone', () => {
      // implement
    });

    test.todo('copy', () => {
      // implement
    });

    test('dispose', () => {
      const object = new Material();
      object.dispose();

      expect(object).toBeDefined();
    });
  });
});
