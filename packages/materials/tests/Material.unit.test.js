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

      // can change based on order of tests
      const prevId = object.id;

      const object2 = new Material();
      expect(object2.id).toBeGreaterThan(prevId);
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

    test('clippingPlanes', () => {
      const object = new Material();
      expect(object.clippingPlanes).toBeNull();
    });

    test('clipIntersection', () => {
      const object = new Material();
      expect(object.clipIntersection).toBe(false);
    });

    test('clipShadows', () => {
      const object = new Material();
      expect(object.clipShadows).toBe(false);
    });

    test('shadowSide', () => {
      const object = new Material();
      expect(object.shadowSide).toBeNull();
    });

    test('colorWrite', () => {
      const object = new Material();
      expect(object.colorWrite).toBe(true);
    });

    test('precision', () => {
      const object = new Material();
      expect(object.precision).toBeNull();
    });

    test('polygonOffset', () => {
      const object = new Material();
      expect(object.polygonOffset).toBe(false);
    });

    test('polygonOffsetFactor', () => {
      const object = new Material();
      expect(object.polygonOffsetFactor).toBe(0);
    });

    test('polygonOffsetUnits', () => {
      const object = new Material();
      expect(object.polygonOffsetUnits).toBe(0);
    });

    test('dithering', () => {
      const object = new Material();
      expect(object.dithering).toBe(false);
    });

    test('alphaToCoverage', () => {
      const object = new Material();
      expect(object.alphaToCoverage).toBe(false);
    });

    test('premultipliedAlpha', () => {
      const object = new Material();
      expect(object.premultipliedAlpha).toBe(false);
    });

    test('forceSinglePass', () => {
      const object = new Material();
      expect(object.forceSinglePass).toBe(false);
    });

    test('visible', () => {
      const object = new Material();
      expect(object.visible).toBe(true);
    });

    test('toneMapped', () => {
      const object = new Material();
      expect(object.toneMapped).toBe(true);
    });

    test('userData', () => {
      const object = new Material();
      expect(object.userData).toBeInstanceOf(Object);
    });

    test('alphaTest', () => {
      const object = new Material();
      expect(object.alphaTest).toBe(0);
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
