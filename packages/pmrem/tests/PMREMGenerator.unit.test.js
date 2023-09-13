import { beforeEach, describe, expect, it, test, vi } from 'vitest';

// import {
//   BackSide,
//   CubeReflectionMapping,
//   CubeRefractionMapping,
//   CubeUVReflectionMapping,
//   HalfFloatType,
//   LinearFilter,
//   LinearSRGBColorSpace,
//   NoBlending,
//   NoToneMapping,
//   RGBAFormat
// } from '@renderlayer/shared';
// import { BufferAttribute, BufferGeometry } from '@renderlayer/buffers';
// import { OrthographicCamera, PerspectiveCamera } from '@renderlayer/cameras';
// import { BoxGeometry } from '@renderlayer/geometries';
// import { MeshBasicMaterial, ShaderMaterial } from '@renderlayer/materials';
// import { Color, Vector3 } from '@renderlayer/math';
// import { Mesh } from '@renderlayer/objects';
// import { WebGLRenderTarget } from '@renderlayer/targets';

import { PMREMGenerator } from '../src/PMREMGenerator';

// vi.mock('@renderlayer/shared');
// vi.mock('@renderlayer/buffers');
// vi.mock('@renderlayer/cameras');
// vi.mock('@renderlayer/geometries');
// vi.mock('@renderlayer/materials');
// vi.mock('@renderlayer/math');
// vi.mock('@renderlayer/objects');
// vi.mock('@renderlayer/targets');

describe('PMREM', () => {
  describe.todo('PMREMGenerator', () => {
    let instance;

    beforeEach(() => {
      instance = new PMREMGenerator();
    });

    it('instance should be an instanceof PMREMGenerator', () => {
      expect(instance).toBeInstanceOf(PMREMGenerator);
    });

    // it('should have a method fromScene()', () => {
    //   // instance.fromScene(scene,sigma,near,far);
    //   expect(false).toBeTruthy();
    // });

    // it('should have a method fromEquirectangular()', () => {
    //   // instance.fromEquirectangular(equirectangular,renderTarget);
    //   expect(false).toBeTruthy();
    // });

    // it('should have a method fromCubemap()', () => {
    //   // instance.fromCubemap(cubemap,renderTarget);
    //   expect(false).toBeTruthy();
    // });

    // it('should have a method compileCubemapShader()', () => {
    //   // instance.compileCubemapShader();
    //   expect(false).toBeTruthy();
    // });

    // it('should have a method compileEquirectangularShader()', () => {
    //   // instance.compileEquirectangularShader();
    //   expect(false).toBeTruthy();
    // });

    // it('should have a method dispose()', () => {
    //   // instance.dispose();
    //   expect(false).toBeTruthy();
    // });

    // it('should have a method _setSize()', () => {
    //   // instance._setSize(cubeSize);
    //   expect(false).toBeTruthy();
    // });

    // it('should have a method _dispose()', () => {
    //   // instance._dispose();
    //   expect(false).toBeTruthy();
    // });

    // it('should have a method _cleanup()', () => {
    //   // instance._cleanup(outputTarget);
    //   expect(false).toBeTruthy();
    // });

    // it('should have a method _fromTexture()', () => {
    //   // instance._fromTexture(texture,renderTarget);
    //   expect(false).toBeTruthy();
    // });

    // it('should have a method _allocateTargets()', () => {
    //   // instance._allocateTargets();
    //   expect(false).toBeTruthy();
    // });

    // it('should have a method _compileMaterial()', () => {
    //   // instance._compileMaterial(material);
    //   expect(false).toBeTruthy();
    // });

    // it('should have a method _sceneToCubeUV()', () => {
    //   // instance._sceneToCubeUV(scene,near,far,cubeUVRenderTarget);
    //   expect(false).toBeTruthy();
    // });

    // it('should have a method _textureToCubeUV()', () => {
    //   // instance._textureToCubeUV(texture,cubeUVRenderTarget);
    //   expect(false).toBeTruthy();
    // });

    // it('should have a method _applyPMREM()', () => {
    //   // instance._applyPMREM(cubeUVRenderTarget);
    //   expect(false).toBeTruthy();
    // });

    // it('should have a method _blur()', () => {
    //   // instance._blur(cubeUVRenderTarget,lodIn,lodOut,sigma,poleAxis);
    //   expect(false).toBeTruthy();
    // });

    // it('should have a method _halfBlur()', () => {
    //   // instance._halfBlur(targetIn,targetOut,lodIn,lodOut,sigmaRadians,direction,poleAxis);
    //   expect(false).toBeTruthy();
    // });
  });
});
