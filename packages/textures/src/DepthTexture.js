import { Source } from './Source.js';
import { Texture } from './Texture.js';
import {
  NearestFilter,
  UnsignedIntType,
  DepthFormat,
  DepthStencilFormat
} from '@renderlayer/shared';

/**
 * @import { NeverCompare, LessCompare, EqualCompare } from '@renderlayer/shared';
 * @import { LessEqualCompare, GreaterCompare, NotEqualCompare } from '@renderlayer/shared';
 * @import { GreaterEqualCompare, AlwaysCompare } from '@renderlayer/shared';
 */

class DepthTexture extends Texture {
  /**
   * Code corresponding to the depth compare function.
   *
   * @type {?(NeverCompare|LessCompare|EqualCompare|
   *          LessEqualCompare|GreaterCompare|NotEqualCompare|
   *          GreaterEqualCompare|AlwaysCompare)}
   */
  compareFunction = null;

  constructor(
    width,
    height,
    type = UnsignedIntType,
    mapping,
    wrapS,
    wrapT,
    magFilter = NearestFilter,
    minFilter = NearestFilter,
    anisotropy,
    format = DepthFormat,
    depth = 1
  ) {
    if (format !== DepthFormat && format !== DepthStencilFormat) {
      throw new Error('DepthTexture format must be either DepthFormat or DepthStencilFormat');
    }

    const image = { width: width, height: height, depth: depth };

    super(image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);

    this.flipY = false;
    this.generateMipmaps = false;
  }

  get isDepthTexture() {
    return true;
  }

  copy(source) {
    super.copy(source);

    this.source = new Source(Object.assign({}, source.image)); // see #30540
    this.compareFunction = source.compareFunction;

    return this;
  }

  toJSON(meta) {
    const data = super.toJSON(meta);

    if (this.compareFunction !== null) data.compareFunction = this.compareFunction;

    return data;
  }
}

export { DepthTexture };
