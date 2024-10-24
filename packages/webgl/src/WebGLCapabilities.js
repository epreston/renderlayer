/** @param { WebGL2RenderingContext} gl */
function WebGLCapabilities(gl, extensions, parameters) {
  let maxAnisotropy;

  function getMaxAnisotropy() {
    if (maxAnisotropy !== undefined) return maxAnisotropy;

    if (extensions.has('EXT_texture_filter_anisotropic') === true) {
      const extension = extensions.get('EXT_texture_filter_anisotropic');

      maxAnisotropy = gl.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else {
      maxAnisotropy = 0;
    }

    return maxAnisotropy;
  }

  function getMaxPrecision(precision) {
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

  const isWebGL2 =
    typeof WebGL2RenderingContext !== 'undefined' &&
    gl.constructor.name === 'WebGL2RenderingContext';

  let precision = parameters.precision !== undefined ? parameters.precision : 'highp';
  const maxPrecision = getMaxPrecision(precision);

  if (maxPrecision !== precision) {
    console.warn('WebGLRenderer:', precision, 'not supported, using', maxPrecision, 'instead.');
    precision = maxPrecision;
  }

  const drawBuffers = true;

  const logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true;

  const maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
  const maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);

  const maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
  const maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
  const maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
  const maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

  const vertexTextures = maxVertexTextures > 0;
  const floatFragmentTextures = true;
  const floatVertexTextures = vertexTextures && floatFragmentTextures;

  const maxSamples = gl.getParameter(gl.MAX_SAMPLES);

  return {
    isWebGL2,

    drawBuffers,

    getMaxAnisotropy,
    getMaxPrecision,

    precision,
    logarithmicDepthBuffer,

    maxTextures,
    maxVertexTextures,
    maxTextureSize,
    maxCubemapSize,

    maxAttributes,
    maxVertexUniforms,
    maxVaryings,
    maxFragmentUniforms,

    vertexTextures,
    floatFragmentTextures,
    floatVertexTextures,

    maxSamples
  };
}

export { WebGLCapabilities };
