import { ShaderMaterial } from './ShaderMaterial.js';

class RawShaderMaterial extends ShaderMaterial {
  constructor(parameters) {
    super(parameters);

    this.type = 'RawShaderMaterial';
  }

  get isRawShaderMaterial() {
    return true;
  }
}

export { RawShaderMaterial };
