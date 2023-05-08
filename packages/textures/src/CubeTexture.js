import { CubeReflectionMapping } from '@renderlayer/shared';

import { Texture } from './Texture.js';

class CubeTexture extends Texture {
  constructor(images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace) {
    // TODO: move to default parameters
    images = images !== undefined ? images : [];
    mapping = mapping !== undefined ? mapping : CubeReflectionMapping;

    super(images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace);

    this.isCubeTexture = true;

    this.flipY = false;
  }

  get images() {
    return this.image;
  }

  set images(value) {
    this.image = value;
  }
}

export { CubeTexture };
