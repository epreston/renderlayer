import { Light } from './Light.js';

class AmbientLight extends Light {
  type = 'AmbientLight';

  constructor(color, intensity) {
    super(color, intensity);
  }

  get isAmbientLight() {
    return true;
  }
}

export { AmbientLight };
