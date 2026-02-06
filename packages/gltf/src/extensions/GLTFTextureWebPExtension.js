import { EXTENSIONS } from './EXTENSIONS';

/**
 * @import { GLTFParser } from "../GLTFParser"
 */

/**
 * WebP Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_texture_webp
 */
export class GLTFTextureWebPExtension {
  parser;
  name = EXTENSIONS.EXT_TEXTURE_WEBP;

  /** @param {GLTFParser} parser  */
  constructor(parser) {
    this.parser = parser;
  }

  loadTexture(textureIndex) {
    const name = this.name;
    const parser = this.parser;
    const json = parser.json;

    const textureDef = json.textures[textureIndex];

    if (!textureDef.extensions || !textureDef.extensions[name]) {
      return null;
    }

    const extension = textureDef.extensions[name];
    const source = json.images[extension.source];

    let loader = parser.textureLoader;
    if (source.uri) {
      const handler = parser.options.manager.getHandler(source.uri);
      if (handler !== null) loader = handler;
    }

    return parser.loadTextureImage(textureIndex, extension.source, loader);
  }
}
