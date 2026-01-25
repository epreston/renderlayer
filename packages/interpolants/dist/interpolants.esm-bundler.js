import { ZeroCurvatureEnding, WrapAroundEnding, ZeroSlopeEnding } from '@renderlayer/shared';
import { Quaternion } from '@renderlayer/math';

class Interpolant {
  parameterPositions;
  #cachedIndex = 0;
  resultBuffer;
  sampleValues;
  valueSize;
  settings = null;
  DefaultSettings_ = {};
  constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
    this.parameterPositions = parameterPositions;
    this.resultBuffer = resultBuffer !== void 0 ? resultBuffer : new sampleValues.constructor(sampleSize);
    this.sampleValues = sampleValues;
    this.valueSize = sampleSize;
  }
  evaluate(t) {
    const pp = this.parameterPositions;
    let i1 = this.#cachedIndex;
    let t1 = pp[i1];
    let t0 = pp[i1 - 1];
    validate_interval: {
      seek: {
        let right;
        linear_scan: {
          forward_scan: if (!(t < t1)) {
            for (let giveUpAt = i1 + 2; ; ) {
              if (t1 === void 0) {
                if (t < t0) break forward_scan;
                i1 = pp.length;
                this.#cachedIndex = i1;
                return this.copySampleValue_(i1 - 1);
              }
              if (i1 === giveUpAt) break;
              t0 = t1;
              t1 = pp[++i1];
              if (t < t1) {
                break seek;
              }
            }
            right = pp.length;
            break linear_scan;
          }
          if (!(t >= t0)) {
            const t1global = pp[1];
            if (t < t1global) {
              i1 = 2;
              t0 = t1global;
            }
            for (let giveUpAt = i1 - 2; ; ) {
              if (t0 === void 0) {
                this.#cachedIndex = 0;
                return this.copySampleValue_(0);
              }
              if (i1 === giveUpAt) break;
              t1 = t0;
              t0 = pp[--i1 - 1];
              if (t >= t0) {
                break seek;
              }
            }
            right = i1;
            i1 = 0;
            break linear_scan;
          }
          break validate_interval;
        }
        while (i1 < right) {
          const mid = i1 + right >>> 1;
          if (t < pp[mid]) {
            right = mid;
          } else {
            i1 = mid + 1;
          }
        }
        t1 = pp[i1];
        t0 = pp[i1 - 1];
        if (t0 === void 0) {
          this.#cachedIndex = 0;
          return this.copySampleValue_(0);
        }
        if (t1 === void 0) {
          i1 = pp.length;
          this.#cachedIndex = i1;
          return this.copySampleValue_(i1 - 1);
        }
      }
      this.#cachedIndex = i1;
      this.intervalChanged_(i1, t0, t1);
    }
    return this.interpolate_(i1, t0, t, t1);
  }
  getSettings_() {
    return this.settings || this.DefaultSettings_;
  }
  copySampleValue_(index) {
    const result = this.resultBuffer;
    const values = this.sampleValues;
    const stride = this.valueSize;
    const offset = index * stride;
    for (let i = 0; i !== stride; ++i) {
      result[i] = values[offset + i];
    }
    return result;
  }
  // Template methods for derived classes:
  interpolate_(_i1, _t0, _t, _t1) {
    throw new Error("call to abstract method");
  }
  intervalChanged_(_i1, _t0, _t1) {
  }
}

class CubicInterpolant extends Interpolant {
  _weightPrev = -0;
  // see unit test
  _offsetPrev = -0;
  _weightNext = -0;
  _offsetNext = -0;
  DefaultSettings_ = {
    endingStart: ZeroCurvatureEnding,
    endingEnd: ZeroCurvatureEnding
  };
  constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer);
  }
  intervalChanged_(i1, t0, t1) {
    const pp = this.parameterPositions;
    let iPrev = i1 - 2;
    let iNext = i1 + 1;
    let tPrev = pp[iPrev];
    let tNext = pp[iNext];
    if (tPrev === void 0) {
      switch (this.getSettings_().endingStart) {
        case ZeroSlopeEnding:
          iPrev = i1;
          tPrev = 2 * t0 - t1;
          break;
        case WrapAroundEnding:
          iPrev = pp.length - 2;
          tPrev = t0 + pp[iPrev] - pp[iPrev + 1];
          break;
        default:
          iPrev = i1;
          tPrev = t1;
      }
    }
    if (tNext === void 0) {
      switch (this.getSettings_().endingEnd) {
        case ZeroSlopeEnding:
          iNext = i1;
          tNext = 2 * t1 - t0;
          break;
        case WrapAroundEnding:
          iNext = 1;
          tNext = t1 + pp[1] - pp[0];
          break;
        default:
          iNext = i1 - 1;
          tNext = t0;
      }
    }
    const halfDt = (t1 - t0) * 0.5;
    const stride = this.valueSize;
    this._weightPrev = halfDt / (t0 - tPrev);
    this._weightNext = halfDt / (tNext - t1);
    this._offsetPrev = iPrev * stride;
    this._offsetNext = iNext * stride;
  }
  interpolate_(i1, t0, t, t1) {
    const result = this.resultBuffer;
    const values = this.sampleValues;
    const stride = this.valueSize;
    const o1 = i1 * stride;
    const o0 = o1 - stride;
    const oP = this._offsetPrev;
    const oN = this._offsetNext;
    const wP = this._weightPrev;
    const wN = this._weightNext;
    const p = (t - t0) / (t1 - t0);
    const pp = p * p;
    const ppp = pp * p;
    const sP = -wP * ppp + 2 * wP * pp - wP * p;
    const s0 = (1 + wP) * ppp + (-1.5 - 2 * wP) * pp + (-0.5 + wP) * p + 1;
    const s1 = (-1 - wN) * ppp + (1.5 + wN) * pp + 0.5 * p;
    const sN = wN * ppp - wN * pp;
    for (let i = 0; i !== stride; ++i) {
      result[i] = sP * values[oP + i] + s0 * values[o0 + i] + s1 * values[o1 + i] + sN * values[oN + i];
    }
    return result;
  }
}

class DiscreteInterpolant extends Interpolant {
  constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer);
  }
  interpolate_(i1) {
    return this.copySampleValue_(i1 - 1);
  }
}

class LinearInterpolant extends Interpolant {
  constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer);
  }
  interpolate_(i1, t0, t, t1) {
    const result = this.resultBuffer;
    const values = this.sampleValues;
    const stride = this.valueSize;
    const offset1 = i1 * stride;
    const offset0 = offset1 - stride;
    const weight1 = (t - t0) / (t1 - t0);
    const weight0 = 1 - weight1;
    for (let i = 0; i !== stride; ++i) {
      result[i] = values[offset0 + i] * weight0 + values[offset1 + i] * weight1;
    }
    return result;
  }
}

class QuaternionLinearInterpolant extends Interpolant {
  constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer);
  }
  interpolate_(i1, t0, t, t1) {
    const result = this.resultBuffer;
    const values = this.sampleValues;
    const stride = this.valueSize;
    const alpha = (t - t0) / (t1 - t0);
    let offset = i1 * stride;
    for (let end = offset + stride; offset !== end; offset += 4) {
      Quaternion.slerpFlat(result, 0, values, offset - stride, values, offset, alpha);
    }
    return result;
  }
}

export { CubicInterpolant, DiscreteInterpolant, Interpolant, LinearInterpolant, QuaternionLinearInterpolant };
