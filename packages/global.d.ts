/// <reference types="vite/client" />

// Global compile-time constants
declare var __DEV__: boolean
declare var __TEST__: boolean
declare var __BROWSER__: boolean
declare var __ESM_BUNDLER__: boolean
declare var __NODE_JS__: boolean
declare var __COMMIT__: string
declare var __VERSION__: string

// for tests
declare namespace jest {
  interface Matchers<R, T> {
    toHaveBeenWarned(): R
    toHaveBeenWarnedLast(): R
    toHaveBeenWarnedTimes(n: number): R
  }
}

declare interface String {
  /**
   * @deprecated Please use String.prototype.slice instead of String.prototype.substring in the repository.
   */
  substring(start: number, end?: number): string
}

declare interface Color {
  /**
   * @deprecated Removed.
   */
  setColorName(style: string, colorSpace?: string): this;

  /**
   * @deprecated Removed.
   */
  static NAMES: object;
}

declare interface ColorManagement {

  /**
   * @deprecated ColorManagement.legacyMode=false renamed to .enabled=true.
   */
  get legacyMode(): boolean

  /**
   * @deprecated ColorManagement.legacyMode=false renamed to .enabled=true.
   */
  set legacyMode(legacyMode: boolean)

  /**
   * @deprecated ColorManagement.workingColorSpace is readonly.
   */
  set workingColorSpace(colorSpace: string)
}

declare interface Triangle {

  /**
   * @deprecated Triangle.getUV() has been renamed to Triangle.getInterpolation().
   */
  static getUV( point, p1, p2, p3, uv1, uv2, uv3, target )

  /**
   * @deprecated Triangle.getUV() has been renamed to Triangle.getInterpolation().
   */
  getUV( point, uv1, uv2, uv3, target )
}
