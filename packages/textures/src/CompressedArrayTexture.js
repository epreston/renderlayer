import { ClampToEdgeWrapping } from '@renderlayer/shared';
import { CompressedTexture } from './CompressedTexture.js';

class CompressedArrayTexture extends CompressedTexture {
  wrapR = ClampToEdgeWrapping;

  constructor(mipmaps, width, height, depth, format, type) {
    super(mipmaps, width, height, format, type);

    this.image.depth = depth;
  }

  get isCompressedArrayTexture() {
    return true;
  }
}

export { CompressedArrayTexture };
