import { CubeReflectionMapping } from '@renderlayer/shared';

import { Texture } from './Texture.js';

class CubeTexture extends Texture {
  constructor(
    images = [],
    mapping = CubeReflectionMapping,
    wrapS,
    wrapT,
    magFilter,
    minFilter,
    format,
    type,
    anisotropy,
    colorSpace
  ) {
    super(
      images,
      mapping,
      wrapS,
      wrapT,
      magFilter,
      minFilter,
      format,
      type,
      anisotropy,
      colorSpace
    );

    this.flipY = false;
  }

  get isCubeTexture() {
    return true;
  }

  get images() {
    return this.image;
  }

  set images(value) {
    this.image = value;
  }
}

export { CubeTexture };
