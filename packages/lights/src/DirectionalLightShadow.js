import { OrthographicCamera } from '@renderlayer/cameras';
import { LightShadow } from './LightShadow.js';

class DirectionalLightShadow extends LightShadow {
  constructor() {
    super(new OrthographicCamera(-5, 5, 5, -5, 0.5, 500));
  }

  get isDirectionalLightShadow() {
    return true;
  }
}

export { DirectionalLightShadow };
