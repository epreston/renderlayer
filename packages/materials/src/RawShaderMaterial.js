import { ShaderMaterial } from './ShaderMaterial.js';

class RawShaderMaterial extends ShaderMaterial {
  type = 'RawShaderMaterial';

  constructor(parameters) {
    super(parameters);
  }

  get isRawShaderMaterial() {
    return true;
  }
}

export { RawShaderMaterial };
