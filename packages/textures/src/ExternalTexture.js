import { Texture } from './Texture.js';

class ExternalTexture extends Texture {
  sourceTexture = null;

  constructor(sourceTexture = null) {
    super();

    this.sourceTexture = sourceTexture;
  }

  get isExternalTexture() {
    return true;
  }

  copy(source) {
    super.copy(source);

    this.sourceTexture = source.sourceTexture;

    return this;
  }
}

export { ExternalTexture };
