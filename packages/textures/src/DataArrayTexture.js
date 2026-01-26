import { ClampToEdgeWrapping, NearestFilter } from '@renderlayer/shared';
import { Texture } from './Texture.js';

class DataArrayTexture extends Texture {
  constructor(data = null, width = 1, height = 1, depth = 1) {
    super(null);

    this.image = { data, width, height, depth };

    this.magFilter = NearestFilter;
    this.minFilter = NearestFilter;

    this.wrapR = ClampToEdgeWrapping;

    this.generateMipmaps = false;
    this.flipY = false;
    this.unpackAlignment = 1;
  }

  get isDataArrayTexture() {
    return true;
  }
}

export { DataArrayTexture };
