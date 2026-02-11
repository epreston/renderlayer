import { PerspectiveCamera } from './PerspectiveCamera.js';

class ArrayCamera extends PerspectiveCamera {
  cameras;

  isMultiViewCamera = false;

  /**
   * @param {Array<PerspectiveCamera>} [array=[]]
   */
  constructor(array = []) {
    super();

    this.cameras = array;
  }

  get isArrayCamera() {
    return true;
  }
}

export { ArrayCamera };
