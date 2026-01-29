import { Matrix3 } from './Matrix3.js';

const NoColorSpace = '';
const SRGBColorSpace = 'srgb';
const LinearSRGBColorSpace = 'srgb-linear';
const DisplayP3ColorSpace = 'display-p3';
const LinearDisplayP3ColorSpace = 'display-p3-linear';

const LinearTransfer = 'linear';
const SRGBTransfer = 'srgb';

const Rec709Primaries = 'rec709';
const P3Primaries = 'p3';

export function SRGBToLinear(c) {
  // prettier-ignore
  return ( c < 0.04045 )
    ? c * 0.0773993808
    : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 );
}

export function LinearToSRGB(c) {
  // prettier-ignore
  return ( c < 0.0031308 )
    ? c * 12.92
    : 1.055 * ( Math.pow( c, 0.41666 ) ) - 0.055;
}

/**
 * Matrices converting P3 <-> Rec. 709 primaries, without gamut mapping
 * or clipping. Based on W3C specifications for sRGB and Display P3,
 * and ICC specifications for the D50 connection space. Values in/out
 * are _linear_ sRGB and _linear_ Display P3.
 *
 * Note that both sRGB and Display P3 use the sRGB transfer functions.
 *
 * Reference:
 * - http://www.russellcottrell.com/photo/matrixCalculator.htm
 */

// prettier-ignore
const LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = /*@__PURE__*/ new Matrix3().set(
	0.8224621, 0.177538, 0.0,
	0.0331941, 0.9668058, 0.0,
	0.0170827, 0.0723974, 0.9105199,
);

// prettier-ignore
const LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = /*@__PURE__*/ new Matrix3().set(
	1.2249401, - 0.2249404, 0.0,
	- 0.0420569, 1.0420571, 0.0,
	- 0.0196376, - 0.0786361, 1.0982735
);

/**
 * Defines supported color spaces by transfer function and primaries,
 * and provides conversions to/from the Linear-sRGB reference space.
 */
const COLOR_SPACES = {
  [LinearSRGBColorSpace]: {
    transfer: LinearTransfer,
    primaries: Rec709Primaries,
    toReference: (color) => color,
    fromReference: (color) => color
  },
  [SRGBColorSpace]: {
    transfer: SRGBTransfer,
    primaries: Rec709Primaries,
    toReference: (color) => color.convertSRGBToLinear(),
    fromReference: (color) => color.convertLinearToSRGB()
  },
  [LinearDisplayP3ColorSpace]: {
    transfer: LinearTransfer,
    primaries: P3Primaries,
    toReference: (color) => color.applyMatrix3(LINEAR_DISPLAY_P3_TO_LINEAR_SRGB),
    fromReference: (color) => color.applyMatrix3(LINEAR_SRGB_TO_LINEAR_DISPLAY_P3)
  },
  [DisplayP3ColorSpace]: {
    transfer: SRGBTransfer,
    primaries: P3Primaries,
    toReference: (color) =>
      color.convertSRGBToLinear().applyMatrix3(LINEAR_DISPLAY_P3_TO_LINEAR_SRGB),
    fromReference: (color) =>
      color.applyMatrix3(LINEAR_SRGB_TO_LINEAR_DISPLAY_P3).convertLinearToSRGB()
  }
};

const SUPPORTED_WORKING_COLOR_SPACES = new Set([LinearSRGBColorSpace, LinearDisplayP3ColorSpace]);

/**
 * @import { Color } from "@renderlayer/math"
 */

export const ColorManagement = {
  enabled: true,

  _workingColorSpace: LinearSRGBColorSpace,

  get workingColorSpace() {
    return this._workingColorSpace;
  },

  set workingColorSpace(colorSpace) {
    if (!SUPPORTED_WORKING_COLOR_SPACES.has(colorSpace)) {
      throw new Error(`Unsupported working color space, "${colorSpace}".`);
    }

    this._workingColorSpace = colorSpace;
  },

  /** @param {Color} color */
  convert(color, sourceColorSpace, targetColorSpace) {
    if (
      this.enabled === false ||
      sourceColorSpace === targetColorSpace ||
      !sourceColorSpace ||
      !targetColorSpace
    ) {
      return color;
    }

    if (
      COLOR_SPACES[sourceColorSpace] === undefined ||
      COLOR_SPACES[targetColorSpace] === undefined
    ) {
      throw new Error(
        `Unsupported color space conversion, "${sourceColorSpace}" to "${targetColorSpace}".`
      );
    }

    const sourceToReference = COLOR_SPACES[sourceColorSpace].toReference;
    const targetFromReference = COLOR_SPACES[targetColorSpace].fromReference;

    return targetFromReference(sourceToReference(color));
  },

  /** @param {Color} color */
  fromWorkingColorSpace(color, targetColorSpace) {
    return this.convert(color, this._workingColorSpace, targetColorSpace);
  },

  /** @param {Color} color */
  toWorkingColorSpace(color, sourceColorSpace) {
    return this.convert(color, sourceColorSpace, this._workingColorSpace);
  },

  getPrimaries(colorSpace) {
    return COLOR_SPACES[colorSpace].primaries;
  },

  getTransfer(colorSpace) {
    if (colorSpace === NoColorSpace) return LinearTransfer;

    return COLOR_SPACES[colorSpace].transfer;
  }
};
