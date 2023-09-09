import { EXTENSIONS } from './EXTENSIONS';

/**
 * Texture Transform Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
 */
export class GLTFTextureTransformExtension {
  constructor() {
    this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM;
  }

  extendTexture(texture, transform) {
    if (
      (transform.texCoord === undefined || transform.texCoord === texture.channel) &&
      transform.offset === undefined &&
      transform.rotation === undefined &&
      transform.scale === undefined
    ) {
      // See #21819.
      return texture;
    }

    texture = texture.clone();

    if (transform.texCoord !== undefined) {
      texture.channel = transform.texCoord;
    }

    if (transform.offset !== undefined) {
      texture.offset.fromArray(transform.offset);
    }

    if (transform.rotation !== undefined) {
      texture.rotation = transform.rotation;
    }

    if (transform.scale !== undefined) {
      texture.repeat.fromArray(transform.scale);
    }

    texture.needsUpdate = true;

    return texture;
  }
}
