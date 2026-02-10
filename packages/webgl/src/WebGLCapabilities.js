import { FloatType, HalfFloatType, RGBAFormat, UnsignedByteType } from '@renderlayer/shared';

/**
 * @import { WebGLExtensions, WebGLUtils } from "@renderlayer/webgl"
 */

class WebGLCapabilities {
  #gl;
  #utils;
  #extensions;

  #maxAnisotropy; // 16
  #precision = 'highp';
  #logarithmicDepthBuffer = false;
  #reversedDepthBuffer = false;

  #maxTextures = 16;
  #maxVertexTextures = 16;
  #maxTextureSize = 16384;
  #maxCubemapSize = 16384;

  #maxAttributes = 16;
  #maxVertexUniforms = 4095;
  #maxVaryings = 30;
  #maxFragmentUniforms = 1024;

  #vertexTextures = true;

  #maxSamples;

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLExtensions} extensions
   * @param {WebGLUtils} utils
   */
  constructor(gl, extensions, parameters, utils) {
    this.#gl = gl;
    this.#utils = utils;
    this.#extensions = extensions;

    this.#precision = parameters.precision !== undefined ? parameters.precision : 'highp';
    const maxPrecision = this.getMaxPrecision(this.#precision);

    if (maxPrecision !== this.#precision) {
      console.warn(
        `WebGLRenderer: ${this.#precision} not supported, using ${maxPrecision} instead.`
      );
      this.#precision = maxPrecision;
    }

    this.#logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true;
    this.#reversedDepthBuffer =
      parameters.reversedDepthBuffer === true && extensions.has('EXT_clip_control'); // 79.4%

    this.#maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    this.#maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    this.#maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    this.#maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);

    this.#maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    this.#maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    this.#maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
    this.#maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

    this.#vertexTextures = this.#maxVertexTextures > 0;

    this.#maxSamples = gl.getParameter(gl.MAX_SAMPLES);
  }

  getMaxAnisotropy() {
    const gl = this.#gl;

    if (this.#maxAnisotropy !== undefined) return this.#maxAnisotropy;

    if (this.#extensions.has('EXT_texture_filter_anisotropic') === true) {
      const extension = this.#extensions.get('EXT_texture_filter_anisotropic'); // 98.81%

      this.#maxAnisotropy = gl.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else {
      this.#maxAnisotropy = 0;
    }

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

  textureFormatReadable(textureFormat) {
    const gl = this.#gl;

    if (
      textureFormat !== RGBAFormat &&
      this.#utils.convert(textureFormat) !== gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_FORMAT)
    ) {
      return false;
    }

    return true;
  }

  textureTypeReadable(textureType) {
    const gl = this.#gl;

    const halfFloatSupportedByExt =
      textureType === HalfFloatType &&
      (this.#extensions.has('EXT_color_buffer_half_float') || // 88.71%
        this.#extensions.has('EXT_color_buffer_float')); // 99.95%

    if (
      textureType !== UnsignedByteType &&
      this.#utils.convert(textureType) !== gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
      textureType !== FloatType &&
      !halfFloatSupportedByExt
    ) {
      return false;
    }

    return true;
  }

  get isWebGL2() {
    return true;
  }

  get precision() {
    return this.#precision;
  }

  get logarithmicDepthBuffer() {
    return this.#logarithmicDepthBuffer;
  }

  get reversedDepthBuffer() {
    return this.#reversedDepthBuffer;
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

  get maxSamples() {
    return this.#maxSamples;
  }
}

export { WebGLCapabilities };
