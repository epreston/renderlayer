/**
 * @import { WebGLExtensions } from "@renderlayer/webgl"
 */

class WebGLCapabilities {
  #gl;

  #isWebGL2 = true;
  #drawBuffers = true;
  #maxAnisotropy = 16;
  #precision = 'highp';
  #logarithmicDepthBuffer = false;

  #maxTextures = 16;
  #maxVertexTextures = 16;
  #maxTextureSize = 16384;
  #maxCubemapSize = 16384;

  #maxAttributes = 16;
  #maxVertexUniforms = 4095;
  #maxVaryings = 30;
  #maxFragmentUniforms = 1024;

  #vertexTextures = true;
  #floatFragmentTextures = true;
  #floatVertexTextures = true;

  #maxSamples;

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLExtensions} extensions
   */
  constructor(gl, extensions, parameters) {
    this.#gl = gl;

    if (extensions.has('EXT_texture_filter_anisotropic') === true) {
      const extension = extensions.get('EXT_texture_filter_anisotropic');
      this.#maxAnisotropy = gl.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else {
      this.#maxAnisotropy = 0;
    }

    this._isWebGL2 =
      typeof WebGL2RenderingContext !== 'undefined' &&
      gl.constructor.name === 'WebGL2RenderingContext';

    this.#precision = parameters.precision !== undefined ? parameters.precision : 'highp';
    const maxPrecision = this.getMaxPrecision(this.#precision);

    if (maxPrecision !== this.#precision) {
      console.warn(
        `WebGLRenderer: ${this.#precision} not supported, using ${maxPrecision} instead.`
      );
      this.#precision = maxPrecision;
    }

    this.#logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true;

    this.#maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    this.#maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    this.#maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    this.#maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);

    this.#maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    this.#maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    this.#maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
    this.#maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

    this.#vertexTextures = this.#maxVertexTextures > 0;
    this.#floatVertexTextures = this.#vertexTextures && this.#floatFragmentTextures;

    this.#maxSamples = gl.getParameter(gl.MAX_SAMPLES);
  }

  getMaxAnisotropy() {
    return this.#maxAnisotropy;
  }

  getMaxPrecision(precision) {
    const gl = this.#gl;

    if (precision === 'highp') {
      if (
        gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision > 0 &&
        gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0
      ) {
        return 'highp';
      }

      precision = 'mediump';
    }

    if (precision === 'mediump') {
      if (
        gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision > 0 &&
        gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0
      ) {
        return 'mediump';
      }
    }

    return 'lowp';
  }

  get isWebGL2() {
    return this.#isWebGL2;
  }

  get drawBuffers() {
    return this.#drawBuffers;
  }

  get precision() {
    return this.#precision;
  }

  get logarithmicDepthBuffer() {
    return this.#logarithmicDepthBuffer;
  }

  get maxTextures() {
    return this.#maxTextures;
  }

  get maxVertexTextures() {
    return this.#maxVertexTextures;
  }

  get maxTextureSize() {
    return this.#maxTextureSize;
  }

  get maxCubemapSize() {
    return this.#maxCubemapSize;
  }

  get maxAttributes() {
    return this.#maxAttributes;
  }

  get maxVertexUniforms() {
    return this.#maxVertexUniforms;
  }

  get maxVaryings() {
    return this.#maxVaryings;
  }

  get maxFragmentUniforms() {
    return this.#maxFragmentUniforms;
  }

  get vertexTextures() {
    return this.#vertexTextures;
  }

  get floatFragmentTextures() {
    return this.#floatFragmentTextures;
  }

  get floatVertexTextures() {
    return this.#floatVertexTextures;
  }

  get maxSamples() {
    return this.#maxSamples;
  }
}

export { WebGLCapabilities };
