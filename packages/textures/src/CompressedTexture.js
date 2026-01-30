import { Texture } from './Texture.js';

class CompressedTexture extends Texture {
  constructor(
    mipmaps,
    width,
    height,
    format,
    type,
    mapping,
    wrapS,
    wrapT,
    magFilter,
    minFilter,
    anisotropy,
    colorSpace
  ) {
    super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace);

    this.image = { width: width, height: height };
    this.mipmaps = mipmaps;

    // no flipping for cube textures
    // (also flipping doesn't work for compressed textures )
    this.flipY = false;

    // can't generate mipmaps for compressed textures
    // mips must be embedded in compressed files
    this.generateMipmaps = false;
  }

  get isCompressedTexture() {
    return true;
  }
}

export { CompressedTexture };
