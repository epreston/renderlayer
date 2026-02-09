import { WebGLLights } from './WebGLLights.js';

/**
 * @import { WebGLExtensions } from "@renderlayer/webgl"
 */

class WebGLRenderState {
  lights;
  lightsArray;
  shadowsArray;

  state;

  /**
   * @param {WebGLExtensions} extensions
   */
  constructor(extensions) {
    const lights = new WebGLLights(extensions);
    const lightsArray = [];
    const shadowsArray = [];

    this.lights = lights;
    this.lightsArray = lightsArray;
    this.shadowsArray = shadowsArray;

    this.state = {
      lightsArray,
      shadowsArray,
      lights
    };
  }

  init() {
    this.lightsArray.length = 0;
    this.shadowsArray.length = 0;
  }

  pushLight(light) {
    this.lightsArray.push(light);
  }

  pushShadow(shadowLight) {
    this.shadowsArray.push(shadowLight);
  }

  setupLights(useLegacyLights) {
    this.lights.setup(this.lightsArray, useLegacyLights);
  }

  setupLightsView(camera) {
    this.lights.setupView(this.lightsArray, camera);
  }
}

class WebGLRenderStates {
  renderStates = new WeakMap();

  extensions;

  /**
   * @param {WebGLExtensions} extensions
   */
  constructor(extensions) {
    this.extensions = extensions;
  }

  dispose() {
    this.renderStates = new WeakMap();
  }

  get(scene, renderCallDepth = 0) {
    const renderStateArray = this.renderStates.get(scene);
    let renderState;

    if (renderStateArray === undefined) {
      renderState = new WebGLRenderState(this.extensions);
      this.renderStates.set(scene, [renderState]);
    } else {
      if (renderCallDepth >= renderStateArray.length) {
        renderState = new WebGLRenderState(this.extensions);
        renderStateArray.push(renderState);
      } else {
        renderState = renderStateArray[renderCallDepth];
      }
    }

    return renderState;
  }
}

export { WebGLRenderStates, WebGLRenderState };
