/// <reference types="vite/client" />

// ensure this file is treated as a module
export {};

// ambient module declarations

declare module '*.glsl' {
  const src: string;
  export default src;
}

// global compile-time constants

declare var __DEV__: boolean;
declare var __TEST__: boolean;

declare var __BROWSER__: boolean;
declare var __GLOBAL__: boolean;
declare var __ESM_BUNDLER__: boolean;
declare var __ESM_BROWSER__: boolean;
declare var __CJS__: boolean;

declare var __VERSION__: string;
declare var __COMMIT__: string;

// custom matchers for tests

import type { Assertion, AsymmetricMatchersContaining } from 'vitest';

interface CustomMatchers<R = unknown> {
  toHaveBeenWarned(): R;
  toHaveBeenWarnedLast(): R;
  toHaveBeenWarnedTimes(n: number): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// duck typing implemented via boolean type flags

declare module '@renderlayer/buffers' {
  interface BufferAttribute {
    // optional, read-only object properties
    readonly isInstancedBufferAttribute?: boolean;
    readonly isInterleavedBufferAttribute?: boolean;
    readonly isInstancedInterleavedBufferAttribute?: boolean; // EP: exists ?
  }

  interface InterleavedBufferAttribute {
    // optional, read-only object properties
    readonly isInstancedBufferAttribute?: boolean;
    readonly isInstancedInterleavedBufferAttribute?: boolean; // EP: exists ?
  }
}

declare module '@renderlayer/core' {
  interface Object3D {
    // optional, read-only object properties
    readonly isCamera?: boolean;
    readonly isInstancedMesh?: boolean;
    readonly isLight?: boolean;
    readonly isLine?: boolean;
    readonly isLineSegments?: boolean;
    readonly isMesh?: boolean;
    readonly isPoints?: boolean;
    readonly isScene?: boolean;
    readonly isSkinnedMesh?: boolean;
  }
}

declare module '@renderlayer/math' {
  interface Box2 {
    // optional, read-only object properties
    readonly isBox3?: boolean;
  }

  interface Box3 {
    // optional, read-only object properties
    readonly isBox2?: boolean;
  }
}

declare module '@renderlayer/targets' {
  interface RenderTarget {
    // optional, read-only object properties
    readonly isWebGLCubeRenderTarget?: boolean;
    readonly isWebGLRenderTarget?: boolean;
  }
}

declare module '@renderlayer/textures' {
  interface Texture {
    // optional, read-only object properties
    readonly isCompressedArrayTexture?: boolean;
    readonly isCompressedTexture?: boolean;
    readonly isCubeTexture?: boolean;
    readonly isData3DTexture?: boolean;
    readonly isDataArrayTexture?: boolean;
    readonly isDataTexture?: boolean;
    readonly isExternalTexture?: boolean;
    readonly isFramebufferTexture?: boolean;
    readonly isVideoTexture?: boolean;
  }
}

// deprecations

declare global {
  interface String {
    /**
     * @deprecated Please use String.prototype.slice instead of
     * String.prototype.substring in the repository.
     */
    substring(start: number, end?: number): string;
  }
}

declare module '@renderlayer/math' {
  interface Color {
    /** @deprecated Removed. */
    setColorName(style: string, colorSpace?: string): this;

    /** @deprecated Removed. */
    NAMES: object;
  }

  namespace Triangle {
    /** @deprecated Triangle.getUV() renamed to Triangle.getInterpolation(). */
    function getUV(point, p1, p2, p3, uv1, uv2, uv3, target);
  }

  interface Triangle {
    /** @deprecated getUV() renamed to getInterpolation(). */
    getUV(point, uv1, uv2, uv3, target);
  }
}

declare module '@renderlayer/objects' {
  interface SkinnedMesh {
    /** @deprecated Renamed to .applyBoneTransform() */
    boneTransform(index, vector);
  }
}

declare module '@renderlayer/scenes' {
  interface Scene {
    /** @deprecated autoUpdate was renamed to matrixWorldAutoUpdate */
    autoUpdate: boolean;
  }
}

declare module '@renderlayer/shared' {
  /** @deprecated Removed. */
  const TwoPassDoubleSide = 2;

  /** @deprecated Removed: Use LinearSRGBColorSpace or NoColorSpace */
  const LinearEncoding = 3000;

  /** @deprecated Removed: Use SRGBColorSpace */
  const sRGBEncoding = 3001;
}

declare module '@renderlayer/textures' {
  interface Texture {
    /** @deprecated Removed. replaced by .colorSpace.*/
    encoding: string;
  }
}
