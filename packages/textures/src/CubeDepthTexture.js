import { DepthTexture } from './DepthTexture.js';
import {
  CubeReflectionMapping,
  NearestFilter,
  UnsignedIntType,
  DepthFormat
} from '@renderlayer/shared';

class CubeDepthTexture extends DepthTexture {
  constructor(
    size,
    type = UnsignedIntType,
    mapping = CubeReflectionMapping,
    wrapS,
    wrapT,
    magFilter = NearestFilter,
    minFilter = NearestFilter,
    anisotropy,
    format = DepthFormat
  ) {
    // Create 6 identical image descriptors for the cube faces
    const image = { width: size, height: size, depth: 1 };
    const images = [image, image, image, image, image, image];

    // Call DepthTexture constructor with width, height
    super(size, size, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, format);

    // Replace the single image with the array of 6 images
    this.image = images;
  }

  get isCubeDepthTexture() {
    return true;
  }

  get isCubeTexture() {
    // Set to true for cube texture handling in WebGLTextures.
    return true;
  }

  get images() {
    return this.image;
  }

  set images(value) {
    this.image = value;
  }
}

export { CubeDepthTexture };
