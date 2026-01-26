import { WebGLLights } from './WebGLLights.js';

class WebGLRenderState {
  lights;
  lightsArray;
  shadowsArray;

  state;

  // EP: params not used
  constructor(extensions, capabilities) {
    const lights = new WebGLLights(extensions, capabilities);
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
  capabilities;

  constructor(extensions, capabilities) {
    this.extensions = extensions;
    this.capabilities = capabilities;
  }

  get(scene, renderCallDepth = 0) {
    const renderStateArray = this.renderStates.get(scene);
    let renderState;

    if (renderStateArray === undefined) {
      renderState = new WebGLRenderState(this.extensions, this.capabilities);
      this.renderStates.set(scene, [renderState]);
    } else {
      if (renderCallDepth >= renderStateArray.length) {
        renderState = new WebGLRenderState(this.extensions, this.capabilities);
        renderStateArray.push(renderState);
      } else {
        renderState = renderStateArray[renderCallDepth];
      }
    }

    return renderState;
  }

  dispose() {
    this.renderStates = new WeakMap();
  }
}

export { WebGLRenderStates, WebGLRenderState };
