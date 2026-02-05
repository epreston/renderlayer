import { RenderTarget } from './RenderTarget.js';

class WebGLRenderTarget extends RenderTarget {
  constructor(width = 1, height = 1, options = {}) {
    super(width, height, options);
  }

  get isWebGLRenderTarget() {
    return true;
  }
}

export { WebGLRenderTarget };
