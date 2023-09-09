import { Quaternion } from '@renderlayer/math';

import { GLTFCubicSplineInterpolant } from './GLTFCubicSplineInterpolant';

const _q = new Quaternion();

export class GLTFCubicSplineQuaternionInterpolant extends GLTFCubicSplineInterpolant {
  interpolate_(i1, t0, t, t1) {
    const result = super.interpolate_(i1, t0, t, t1);

    _q.fromArray(result).normalize().toArray(result);

    return result;
  }
}
