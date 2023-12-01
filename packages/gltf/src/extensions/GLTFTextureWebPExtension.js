import { EXTENSIONS } from './EXTENSIONS';

/**
 * WebP Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_texture_webp
 */
export class GLTFTextureWebPExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.EXT_TEXTURE_WEBP;
    this.isSupported = null;
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

    return this.detectSupport().then(function (isSupported) {
      if (isSupported) return parser.loadTextureImage(textureIndex, extension.source, loader);

      if (json.extensionsRequired && json.extensionsRequired.includes(name)) {
        throw new Error('GLTFLoader: WebP required by asset but unsupported.');
      }

      // Fall back to PNG or JPEG.
      return parser.loadTexture(textureIndex);
    });
  }

  detectSupport() {
    if (!this.isSupported) {
      this.isSupported = new Promise(function (resolve) {
        const image = new Image();

        // Lossy test image. Support for lossy images doesn't guarantee support for all
        // WebP images, unfortunately.
        image.src =
          'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';

        image.onload = image.onerror = function () {
          resolve(image.height === 1);
        };
      });
    }

    return this.isSupported;
  }
}
