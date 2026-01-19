import { QuaternionLinearInterpolant } from '@renderlayer/interpolants';
import { KeyframeTrack } from './KeyframeTrack.js';

/**
 * A Track of quaternion keyframe values.
 */
class QuaternionKeyframeTrack extends KeyframeTrack {
  ValueTypeName = 'quaternion';
  InterpolantFactoryMethodSmooth = undefined;

  InterpolantFactoryMethodLinear(result) {
    return new QuaternionLinearInterpolant(this.times, this.values, this.getValueSize(), result);
  }
}

export { QuaternionKeyframeTrack };
