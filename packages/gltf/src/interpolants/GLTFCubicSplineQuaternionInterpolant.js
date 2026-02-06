import { Quaternion } from '@renderlayer/math';

import { GLTFCubicSplineInterpolant } from './GLTFCubicSplineInterpolant';

const _quaternion = new Quaternion();

export class GLTFCubicSplineQuaternionInterpolant extends GLTFCubicSplineInterpolant {
  interpolate_(i1, t0, t, t1) {
    const result = super.interpolate_(i1, t0, t, t1);

    _quaternion.fromArray(result).normalize().toArray(result);

    return result;
  }
}
