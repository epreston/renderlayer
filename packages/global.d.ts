// deprecation: imports required so we can add to, not overwrite, interfaces
import '@renderlayer/buffers';
import '@renderlayer/math';
import '@renderlayer/objects';
import '@renderlayer/renderers';
import '@renderlayer/scenes';
import '@renderlayer/shared';
import '@renderlayer/targets';
import '@renderlayer/textures';

/// <reference types="vite/client" />

declare module '*.glsl' {
  const src: string;
  export default src;
}

// Global compile-time constants
declare var __DEV__: boolean;
declare var __TEST__: boolean;
declare var __BROWSER__: boolean;
declare var __GLOBAL__: boolean;
declare var __ESM_BUNDLER__: boolean;
declare var __ESM_BROWSER__: boolean;
declare var __NODE_JS__: boolean;
declare var __COMMIT__: string;
declare var __VERSION__: string;

// for tests
declare namespace jest {
  interface Matchers<R, T> {
    toHaveBeenWarned(): R;
    toHaveBeenWarnedLast(): R;
    toHaveBeenWarnedTimes(n: number): R;
  }
}

// deprecations

declare interface String {
  /**
   * @deprecated Please use String.prototype.slice instead of String.prototype.substring in the repository.
   */
  substring(start: number, end?: number): string;
}

declare module '@renderlayer/shared' {
  /** @deprecated Removed. */
  declare const TwoPassDoubleSide = 2;

  /** @deprecated Removed: Use LinearSRGBColorSpace or NoColorSpace */
  declare const LinearEncoding = 3000;

  /** @deprecated Removed: Use SRGBColorSpace */
  declare const sRGBEncoding = 3001;
}

declare module '@renderlayer/math' {
  declare class Color {
    /** @deprecated Removed. */
    setColorName(style: string, colorSpace?: string): this;

    /** @deprecated Removed. */
    NAMES: object;
  }

  // EP: not working : can not extend block-scoped variable
  declare interface ColorManagement {
    /**
     * @deprecated ColorManagement.legacyMode=false renamed to .enabled=true.
     */
    get legacyMode(): boolean;

    /**
     * @deprecated ColorManagement.legacyMode=false renamed to .enabled=true.
     */
    set legacyMode(legacyMode: boolean);

    /**
     * @deprecated ColorManagement.workingColorSpace is readonly.
     */
    set workingColorSpace(colorSpace: string);
  }

  declare class Triangle {
    /**
     * @deprecated Triangle.getUV() has been renamed to Triangle.getInterpolation().
     */
    getUV(point, p1, p2, p3, uv1, uv2, uv3, target);

    /**
     * @deprecated Triangle.getUV() has been renamed to Triangle.getInterpolation().
     */
    getUV(point, uv1, uv2, uv3, target);
  }
}

declare module '@renderlayer/scenes' {
  declare interface Scene {
    /**
     * @deprecated Scene: autoUpdate was renamed to matrixWorldAutoUpdate
     */
    get autoUpdate(): boolean;

    /**
     * @deprecated Scene: autoUpdate was renamed to matrixWorldAutoUpdate
     */
    set autoUpdate(value: boolean);
  }
}

declare module '@renderlayer/buffers' {
  declare class BufferGeometry {
    /** @deprecated Removed. Use mergeBufferGeometry */
    merge(): this;
  }

  /** @deprecated Removed. Use BufferGeometryUtils: mergeBufferGeometries() has been renamed to mergeGeometries() */
  function mergeBufferGeometries(geometries, useGroups = false);

  /** @deprecated Removed. BufferGeometryUtils: mergeBufferAttributes() has been renamed to mergeAttributes() */
  function mergeBufferAttributes(attributes);
}

declare module '@renderlayer/textures' {
  declare class Texture {
    /** @deprecated Removed. replaced by .colorSpace.*/
    get encoding();

    /** @deprecated Removed. replaced by .colorSpace. */
    set encoding(encoding);
  }
}

declare module '@renderlayer/renderers' {
  declare class WebGLRenderer {

    /** @deprecated Multiply light intensity values by PI when false. */
    useLegacyLights;

    /** @deprecated Removed. Use .useLegacyLights instead. */
    get physicallyCorrectLights();

    /** @deprecated Removed. Use .useLegacyLights instead. */
    set physicallyCorrectLights(value);

    /** @deprecated Removed. Use .outputColorSpace instead. */
    get outputEncoding();

    /** @deprecated Removed. Use .outputColorSpace instead. */
    set outputEncoding(encoding);
  }
}

declare module '@renderlayer/targets' {
  // declare class WebGLRenderTarget {
  //   // constructor option .encoding deprecated, use .colorSpace
  // }
  // declare class WebGLCubeRenderTarget {
  //   // constructor option .encoding deprecated, use .colorSpace
  // }
}

declare module '@renderlayer/objects' {
  declare class SkinnedMesh {
    /** @deprecated Renamed to .applyBoneTransform() */
    boneTransform(index, vector);
  }
}
