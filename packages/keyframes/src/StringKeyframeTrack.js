import { InterpolateDiscrete } from '@renderlayer/shared';
import { KeyframeTrack } from './KeyframeTrack.js';

/**
 * A Track that interpolates Strings
 */
class StringKeyframeTrack extends KeyframeTrack {
  ValueTypeName = 'string';
  ValueBufferType = Array;
  DefaultInterpolation = InterpolateDiscrete;
  InterpolantFactoryMethodLinear = undefined;
  InterpolantFactoryMethodSmooth = undefined;
}

export { StringKeyframeTrack };
