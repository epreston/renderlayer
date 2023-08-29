import { describe, expect, it, test, vi } from 'vitest';

import {
  AddEquation,
  AlwaysStencilFunc,
  FrontSide,
  KeepStencilOp,
  LessEqualDepth,
  NormalBlending,
  OneMinusSrcAlphaFactor,
  SrcAlphaFactor
} from '@renderlayer/shared';
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

    test('id', () => {
      const object = new Material();
      expect(object.id).toBeDefined();
    });

    test('uuid', () => {
      const object = new Material();

      expect(object.uuid).to.be.a('string');
      expect(object.uuid).to.have.length(36);
    });

    test('name', () => {
      const object = new Material();
      expect(object.name).toBe('');
    });

    test('isMaterial', () => {
      const object = new Material();
      expect(object.isMaterial).toBeTruthy();
    });

    test('type', () => {
      const object = new Material();
      expect(object.type).toBe('Material');
    });

    test('blending', () => {
      const object = new Material();
      expect(object.blending).toBe(NormalBlending);
    });

    test('side', () => {
      const object = new Material();
      expect(object.side).toBe(FrontSide);
    });

    test('vertexColors', () => {
      const object = new Material();
      expect(object.vertexColors).toBe(false);
    });

    test('opacity', () => {
      const object = new Material();
      expect(object.opacity).toBe(1);
    });

    test('transparent', () => {
      const object = new Material();
      expect(object.transparent).toBe(false);
    });

    test('blendSrc', () => {
      const object = new Material();
      expect(object.blendSrc).toBe(SrcAlphaFactor);
    });

    test('blendDst', () => {
      const object = new Material();
      expect(object.blendDst).toBe(OneMinusSrcAlphaFactor);
    });

    test('blendEquation', () => {
      const object = new Material();
      expect(object.blendEquation).toBe(AddEquation);
    });

    test('blendSrcAlpha', () => {
      const object = new Material();
      expect(object.blendSrcAlpha).toBeNull();
    });

    test('blendDstAlpha', () => {
      const object = new Material();
      expect(object.blendDstAlpha).toBeNull();
    });

    test('blendEquationAlpha', () => {
      const object = new Material();
      expect(object.blendEquationAlpha).toBeNull();
    });

    test('depthFunc', () => {
      const object = new Material();
      expect(object.depthFunc).toBe(LessEqualDepth);
    });

    test('depthTest', () => {
      const object = new Material();
      expect(object.depthTest).toBe(true);
    });

    test('depthWrite', () => {
      const object = new Material();
      expect(object.depthWrite).toBe(true);
    });

    test('stencilWriteMask', () => {
      const object = new Material();
      expect(object.stencilWriteMask).toBe(0xff);
    });

    test('stencilFunc', () => {
      const object = new Material();
      expect(object.stencilFunc).toBe(AlwaysStencilFunc);
    });

    test('stencilRef', () => {
      const object = new Material();
      expect(object.stencilRef).toBe(0);
    });

    test('stencilFuncMask', () => {
      const object = new Material();
      expect(object.stencilFuncMask).toBe(0xff);
    });

    test('stencilFail', () => {
      const object = new Material();
      expect(object.stencilFail).toBe(KeepStencilOp);
    });

    test('stencilZFail', () => {
      const object = new Material();
      expect(object.stencilZFail).toBe(KeepStencilOp);
    });

    test('stencilZPass', () => {
      const object = new Material();
      expect(object.stencilZPass).toBe(KeepStencilOp);
    });

    test('stencilWrite', () => {
      const object = new Material();
      expect(object.stencilWrite).toBe(false);
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
