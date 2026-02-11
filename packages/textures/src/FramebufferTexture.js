import { NearestFilter } from '@renderlayer/shared';

import { Texture } from './Texture.js';

class FramebufferTexture extends Texture {
  constructor(width, height) {
    super({ width, height });

    this.magFilter = NearestFilter;

    this.minFilter = NearestFilter;

    this.generateMipmaps = false;

    this.needsUpdate = true;
  }

  get isFramebufferTexture() {
    return true;
  }
}

export { FramebufferTexture };
