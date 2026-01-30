import { CubeReflectionMapping } from '@renderlayer/shared';
import { CompressedTexture } from './CompressedTexture.js';

class CompressedCubeTexture extends CompressedTexture {
  constructor(images, format, type) {
    super(undefined, images[0].width, images[0].height, format, type, CubeReflectionMapping);

    this.image = images;
  }

  get isCompressedCubeTexture() {
    return true;
  }

  get isCubeTexture() {
    return true;
  }
}

export { CompressedCubeTexture };
