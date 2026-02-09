import { ColorManagement } from '@renderlayer/math';
import { ShaderChunk } from '@renderlayer/shaders';
import {
  ACESFilmicToneMapping,
  AddOperation,
  CineonToneMapping,
  CubeReflectionMapping,
  CubeRefractionMapping,
  CubeUVReflectionMapping,
  CustomToneMapping,
  DisplayP3ColorSpace,
  GLSL3,
  LinearDisplayP3ColorSpace,
  LinearSRGBColorSpace,
  LinearToneMapping,
  MixOperation,
  MultiplyOperation,
  NoToneMapping,
  P3Primaries,
  PCFShadowMap,
  PCFSoftShadowMap,
  Rec709Primaries,
  ReinhardToneMapping,
  SRGBColorSpace,
  VSMShadowMap
} from '@renderlayer/shared';

import { WebGLShader } from './WebGLShader.js';
import { WebGLUniforms } from './WebGLUniforms.js';

/**
 * @import { WebGLRenderer } from "@renderlayer/renderers"
 * @import { WebGLBindingStates } from "@renderlayer/webgl"
 */

class WebGLProgram {
  #gl;
  #renderer;
  #bindingStates;

  // set up caching for uniform locations
  #cachedUniforms;

  // set up caching for attribute locations
  #cachedAttributes;

  // indicate when the program is ready to be used.
  #programReady;

  // diagnostics
  #prefixVertex;
  #prefixFragment;

  // public
  type;
  name;
  id = _programIdCount++;
  cacheKey;
  usedTimes = 1;
  program;
  vertexShader;
  fragmentShader;

  /**
   * @param {WebGLRenderer} renderer
   * @param {WebGLBindingStates} bindingStates
   */
  constructor(renderer, cacheKey, parameters, bindingStates) {
    // console.log('WebGLProgram', cacheKey);

    this.#gl = renderer.getContext();
    this.#renderer = renderer;
    this.#bindingStates = bindingStates;

    const gl = this.#gl;

    const defines = parameters.defines;

    let vertexShader = parameters.vertexShader;
    let fragmentShader = parameters.fragmentShader;

    const shadowMapTypeDefine = _generateShadowMapTypeDefine(parameters);
    const envMapTypeDefine = _generateEnvMapTypeDefine(parameters);
    const envMapModeDefine = _generateEnvMapModeDefine(parameters);
    const envMapBlendingDefine = _generateEnvMapBlendingDefine(parameters);
    const envMapCubeUVSize = _generateCubeUVSize(parameters);

    const customDefines = _generateDefines(defines);

    this.program = gl.createProgram();

    let prefixVertex;
    let prefixFragment;
    let versionString = parameters.glslVersion ? `#version ${parameters.glslVersion}\n` : '';

    if (parameters.isRawShaderMaterial) {
      prefixVertex = [
        `#define SHADER_TYPE ${parameters.shaderType}`,
        `#define SHADER_NAME ${parameters.shaderName}`,

        customDefines
      ]
        .filter(_filterEmptyLine)
        .join('\n');

      if (prefixVertex.length > 0) {
        prefixVertex += '\n';
      }

      prefixFragment = [
        `#define SHADER_TYPE ${parameters.shaderType}`,
        `#define SHADER_NAME ${parameters.shaderName}`,

        customDefines
      ]
        .filter(_filterEmptyLine)
        .join('\n');

      if (prefixFragment.length > 0) {
        prefixFragment += '\n';
      }
    } else {
      prefixVertex = [
        _generatePrecision(parameters),

        `#define SHADER_TYPE ${parameters.shaderType}`,
        `#define SHADER_NAME ${parameters.shaderName}`,

        customDefines,

        parameters.instancing ? '#define USE_INSTANCING' : '',
        parameters.instancingColor ? '#define USE_INSTANCING_COLOR' : '',

        parameters.useFog && parameters.fog ? '#define USE_FOG' : '',
        parameters.useFog && parameters.fogExp2 ? '#define FOG_EXP2' : '',

        parameters.map ? '#define USE_MAP' : '',
        parameters.envMap ? '#define USE_ENVMAP' : '',
        parameters.envMap ? `#define ${envMapModeDefine}` : '',
        parameters.lightMap ? '#define USE_LIGHTMAP' : '',
        parameters.aoMap ? '#define USE_AOMAP' : '',
        parameters.bumpMap ? '#define USE_BUMPMAP' : '',
        parameters.normalMap ? '#define USE_NORMALMAP' : '',
        parameters.normalMapObjectSpace ? '#define USE_NORMALMAP_OBJECTSPACE' : '',
        parameters.normalMapTangentSpace ? '#define USE_NORMALMAP_TANGENTSPACE' : '',
        parameters.displacementMap ? '#define USE_DISPLACEMENTMAP' : '',
        parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',

        parameters.anisotropy ? '#define USE_ANISOTROPY' : '',
        parameters.anisotropyMap ? '#define USE_ANISOTROPYMAP' : '',

        parameters.clearcoatMap ? '#define USE_CLEARCOATMAP' : '',
        parameters.clearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '',
        parameters.clearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '',

        parameters.iridescenceMap ? '#define USE_IRIDESCENCEMAP' : '',
        parameters.iridescenceThicknessMap ? '#define USE_IRIDESCENCE_THICKNESSMAP' : '',

        parameters.specularMap ? '#define USE_SPECULARMAP' : '',
        parameters.specularColorMap ? '#define USE_SPECULAR_COLORMAP' : '',
        parameters.specularIntensityMap ? '#define USE_SPECULAR_INTENSITYMAP' : '',

        parameters.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
        parameters.metalnessMap ? '#define USE_METALNESSMAP' : '',
        parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
        parameters.alphaHash ? '#define USE_ALPHAHASH' : '',

        parameters.transmission ? '#define USE_TRANSMISSION' : '',
        parameters.transmissionMap ? '#define USE_TRANSMISSIONMAP' : '',
        parameters.thicknessMap ? '#define USE_THICKNESSMAP' : '',

        parameters.sheenColorMap ? '#define USE_SHEEN_COLORMAP' : '',
        parameters.sheenRoughnessMap ? '#define USE_SHEEN_ROUGHNESSMAP' : '',

        //

        parameters.mapUv ? `#define MAP_UV ${parameters.mapUv}` : '',
        parameters.alphaMapUv ? `#define ALPHAMAP_UV ${parameters.alphaMapUv}` : '',
        parameters.lightMapUv ? `#define LIGHTMAP_UV ${parameters.lightMapUv}` : '',
        parameters.aoMapUv ? `#define AOMAP_UV ${parameters.aoMapUv}` : '',
        parameters.emissiveMapUv ? `#define EMISSIVEMAP_UV ${parameters.emissiveMapUv}` : '',
        parameters.bumpMapUv ? `#define BUMPMAP_UV ${parameters.bumpMapUv}` : '',
        parameters.normalMapUv ? `#define NORMALMAP_UV ${parameters.normalMapUv}` : '',
        parameters.displacementMapUv ?
          `#define DISPLACEMENTMAP_UV ${parameters.displacementMapUv}`
        : '',

        parameters.metalnessMapUv ? `#define METALNESSMAP_UV ${parameters.metalnessMapUv}` : '',
        parameters.roughnessMapUv ? `#define ROUGHNESSMAP_UV ${parameters.roughnessMapUv}` : '',
        parameters.anisotropyMapUv ? `#define ANISOTROPYMAP_UV ${parameters.anisotropyMapUv}` : '',

        parameters.clearcoatMapUv ? `#define CLEARCOATMAP_UV ${parameters.clearcoatMapUv}` : '',
        parameters.clearcoatNormalMapUv ?
          `#define CLEARCOAT_NORMALMAP_UV ${parameters.clearcoatNormalMapUv}`
        : '',
        parameters.clearcoatRoughnessMapUv ?
          `#define CLEARCOAT_ROUGHNESSMAP_UV ${parameters.clearcoatRoughnessMapUv}`
        : '',

        parameters.iridescenceMapUv ?
          `#define IRIDESCENCEMAP_UV ${parameters.iridescenceMapUv}`
        : '',
        parameters.iridescenceThicknessMapUv ?
          `#define IRIDESCENCE_THICKNESSMAP_UV ${parameters.iridescenceThicknessMapUv}`
        : '',

        parameters.sheenColorMapUv ? `#define SHEEN_COLORMAP_UV ${parameters.sheenColorMapUv}` : '',
        parameters.sheenRoughnessMapUv ?
          `#define SHEEN_ROUGHNESSMAP_UV ${parameters.sheenRoughnessMapUv}`
        : '',

        parameters.specularMapUv ? `#define SPECULARMAP_UV ${parameters.specularMapUv}` : '',
        parameters.specularColorMapUv ?
          `#define SPECULAR_COLORMAP_UV ${parameters.specularColorMapUv}`
        : '',
        parameters.specularIntensityMapUv ?
          `#define SPECULAR_INTENSITYMAP_UV ${parameters.specularIntensityMapUv}`
        : '',

        parameters.transmissionMapUv ?
          `#define TRANSMISSIONMAP_UV ${parameters.transmissionMapUv}`
        : '',
        parameters.thicknessMapUv ? `#define THICKNESSMAP_UV ${parameters.thicknessMapUv}` : '',

        //

        parameters.vertexTangents && parameters.flatShading === false ? '#define USE_TANGENT' : '',
        parameters.vertexColors ? '#define USE_COLOR' : '',
        parameters.vertexAlphas ? '#define USE_COLOR_ALPHA' : '',
        parameters.vertexUv1s ? '#define USE_UV1' : '',
        parameters.vertexUv2s ? '#define USE_UV2' : '',
        parameters.vertexUv3s ? '#define USE_UV3' : '',

        parameters.pointsUvs ? '#define USE_POINTS_UV' : '',

        parameters.flatShading ? '#define FLAT_SHADED' : '',

        parameters.skinning ? '#define USE_SKINNING' : '',

        parameters.morphTargets ? '#define USE_MORPHTARGETS' : '',
        parameters.morphNormals && parameters.flatShading === false ?
          '#define USE_MORPHNORMALS'
        : '',

        parameters.morphColors ? '#define USE_MORPHCOLORS' : '',

        parameters.morphTargetsCount > 0 ? '#define MORPHTARGETS_TEXTURE' : '',

        parameters.morphTargetsCount > 0 ?
          `#define MORPHTARGETS_TEXTURE_STRIDE ${parameters.morphTextureStride}`
        : '',

        parameters.morphTargetsCount > 0 ?
          `#define MORPHTARGETS_COUNT ${parameters.morphTargetsCount}`
        : '',

        parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
        parameters.flipSided ? '#define FLIP_SIDED' : '',

        parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
        parameters.shadowMapEnabled ? `#define ${shadowMapTypeDefine}` : '',

        parameters.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '',

        parameters.numLightProbes > 0 ? '#define USE_LIGHT_PROBES' : '',

        parameters.useLegacyLights ? '#define LEGACY_LIGHTS' : '',

        parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
        parameters.logarithmicDepthBuffer && parameters.rendererExtensionFragDepth ?
          '#define USE_LOGDEPTHBUF_EXT'
        : '',

        'uniform mat4 modelMatrix;',
        'uniform mat4 modelViewMatrix;',
        'uniform mat4 projectionMatrix;',
        'uniform mat4 viewMatrix;',
        'uniform mat3 normalMatrix;',
        'uniform vec3 cameraPosition;',
        'uniform bool isOrthographic;',

        '#ifdef USE_INSTANCING',

        '	attribute mat4 instanceMatrix;',

        '#endif',

        '#ifdef USE_INSTANCING_COLOR',

        '	attribute vec3 instanceColor;',

        '#endif',

        'attribute vec3 position;',
        'attribute vec3 normal;',
        'attribute vec2 uv;',

        '#ifdef USE_UV1',

        '	attribute vec2 uv1;',

        '#endif',

        '#ifdef USE_UV2',

        '	attribute vec2 uv2;',

        '#endif',

        '#ifdef USE_UV3',

        '	attribute vec2 uv3;',

        '#endif',

        '#ifdef USE_TANGENT',

        '	attribute vec4 tangent;',

        '#endif',

        '#if defined( USE_COLOR_ALPHA )',

        '	attribute vec4 color;',

        '#elif defined( USE_COLOR )',

        '	attribute vec3 color;',

        '#endif',

        '#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )',

        '	attribute vec3 morphTarget0;',
        '	attribute vec3 morphTarget1;',
        '	attribute vec3 morphTarget2;',
        '	attribute vec3 morphTarget3;',

        '	#ifdef USE_MORPHNORMALS',

        '		attribute vec3 morphNormal0;',
        '		attribute vec3 morphNormal1;',
        '		attribute vec3 morphNormal2;',
        '		attribute vec3 morphNormal3;',

        '	#else',

        '		attribute vec3 morphTarget4;',
        '		attribute vec3 morphTarget5;',
        '		attribute vec3 morphTarget6;',
        '		attribute vec3 morphTarget7;',

        '	#endif',

        '#endif',

        '#ifdef USE_SKINNING',

        '	attribute vec4 skinIndex;',
        '	attribute vec4 skinWeight;',

        '#endif',

        '\n'
      ]
        .filter(_filterEmptyLine)
        .join('\n');

      prefixFragment = [
        _generatePrecision(parameters),

        `#define SHADER_TYPE ${parameters.shaderType}`,
        `#define SHADER_NAME ${parameters.shaderName}`,

        customDefines,

        parameters.useFog && parameters.fog ? '#define USE_FOG' : '',
        parameters.useFog && parameters.fogExp2 ? '#define FOG_EXP2' : '',

        parameters.map ? '#define USE_MAP' : '',
        parameters.matcap ? '#define USE_MATCAP' : '',
        parameters.envMap ? '#define USE_ENVMAP' : '',
        parameters.envMap ? `#define ${envMapTypeDefine}` : '',
        parameters.envMap ? `#define ${envMapModeDefine}` : '',
        parameters.envMap ? `#define ${envMapBlendingDefine}` : '',
        envMapCubeUVSize ? `#define CUBEUV_TEXEL_WIDTH ${envMapCubeUVSize.texelWidth}` : '',
        envMapCubeUVSize ? `#define CUBEUV_TEXEL_HEIGHT ${envMapCubeUVSize.texelHeight}` : '',
        envMapCubeUVSize ? `#define CUBEUV_MAX_MIP ${envMapCubeUVSize.maxMip}.0` : '',
        parameters.lightMap ? '#define USE_LIGHTMAP' : '',
        parameters.aoMap ? '#define USE_AOMAP' : '',
        parameters.bumpMap ? '#define USE_BUMPMAP' : '',
        parameters.normalMap ? '#define USE_NORMALMAP' : '',
        parameters.normalMapObjectSpace ? '#define USE_NORMALMAP_OBJECTSPACE' : '',
        parameters.normalMapTangentSpace ? '#define USE_NORMALMAP_TANGENTSPACE' : '',
        parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',

        parameters.anisotropy ? '#define USE_ANISOTROPY' : '',
        parameters.anisotropyMap ? '#define USE_ANISOTROPYMAP' : '',

        parameters.clearcoat ? '#define USE_CLEARCOAT' : '',
        parameters.clearcoatMap ? '#define USE_CLEARCOATMAP' : '',
        parameters.clearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '',
        parameters.clearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '',

        parameters.iridescence ? '#define USE_IRIDESCENCE' : '',
        parameters.iridescenceMap ? '#define USE_IRIDESCENCEMAP' : '',
        parameters.iridescenceThicknessMap ? '#define USE_IRIDESCENCE_THICKNESSMAP' : '',

        parameters.specularMap ? '#define USE_SPECULARMAP' : '',
        parameters.specularColorMap ? '#define USE_SPECULAR_COLORMAP' : '',
        parameters.specularIntensityMap ? '#define USE_SPECULAR_INTENSITYMAP' : '',

        parameters.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
        parameters.metalnessMap ? '#define USE_METALNESSMAP' : '',

        parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
        parameters.alphaTest ? '#define USE_ALPHATEST' : '',
        parameters.alphaHash ? '#define USE_ALPHAHASH' : '',

        parameters.sheen ? '#define USE_SHEEN' : '',
        parameters.sheenColorMap ? '#define USE_SHEEN_COLORMAP' : '',
        parameters.sheenRoughnessMap ? '#define USE_SHEEN_ROUGHNESSMAP' : '',

        parameters.transmission ? '#define USE_TRANSMISSION' : '',
        parameters.transmissionMap ? '#define USE_TRANSMISSIONMAP' : '',
        parameters.thicknessMap ? '#define USE_THICKNESSMAP' : '',

        parameters.vertexTangents && parameters.flatShading === false ? '#define USE_TANGENT' : '',
        parameters.vertexColors || parameters.instancingColor ? '#define USE_COLOR' : '',
        parameters.vertexAlphas ? '#define USE_COLOR_ALPHA' : '',
        parameters.vertexUv1s ? '#define USE_UV1' : '',
        parameters.vertexUv2s ? '#define USE_UV2' : '',
        parameters.vertexUv3s ? '#define USE_UV3' : '',

        parameters.pointsUvs ? '#define USE_POINTS_UV' : '',

        parameters.gradientMap ? '#define USE_GRADIENTMAP' : '',

        parameters.flatShading ? '#define FLAT_SHADED' : '',

        parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
        parameters.flipSided ? '#define FLIP_SIDED' : '',

        parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
        parameters.shadowMapEnabled ? `#define ${shadowMapTypeDefine}` : '',

        parameters.premultipliedAlpha ? '#define PREMULTIPLIED_ALPHA' : '',

        parameters.numLightProbes > 0 ? '#define USE_LIGHT_PROBES' : '',

        parameters.useLegacyLights ? '#define LEGACY_LIGHTS' : '',

        parameters.decodeVideoTexture ? '#define DECODE_VIDEO_TEXTURE' : '',

        parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
        parameters.logarithmicDepthBuffer && parameters.rendererExtensionFragDepth ?
          '#define USE_LOGDEPTHBUF_EXT'
        : '',

        'uniform mat4 viewMatrix;',
        'uniform vec3 cameraPosition;',
        'uniform bool isOrthographic;',

        parameters.toneMapping !== NoToneMapping ? '#define TONE_MAPPING' : '',
        parameters.toneMapping !== NoToneMapping ? ShaderChunk['tonemapping_pars_fragment'] : '', // this code is required here because it is used by the toneMapping() function defined below
        parameters.toneMapping !== NoToneMapping ?
          _getToneMappingFunction('toneMapping', parameters.toneMapping)
        : '',

        parameters.dithering ? '#define DITHERING' : '',
        parameters.opaque ? '#define OPAQUE' : '',

        ShaderChunk['colorspace_pars_fragment'], // this code is required here because it is used by the various encoding/decoding function defined below
        _getTexelEncodingFunction('linearToOutputTexel', parameters.outputColorSpace),

        parameters.useDepthPacking ? `#define DEPTH_PACKING ${parameters.depthPacking}` : '',

        '\n'
      ]
        .filter(_filterEmptyLine)
        .join('\n');
    }

    vertexShader = _resolveIncludes(vertexShader);
    vertexShader = _replaceLightNums(vertexShader, parameters);
    vertexShader = _replaceClippingPlaneNums(vertexShader, parameters);

    fragmentShader = _resolveIncludes(fragmentShader);
    fragmentShader = _replaceLightNums(fragmentShader, parameters);
    fragmentShader = _replaceClippingPlaneNums(fragmentShader, parameters);

    vertexShader = _unrollLoops(vertexShader);
    fragmentShader = _unrollLoops(fragmentShader);

    if (parameters.isRawShaderMaterial !== true) {
      // GLSL 3.0 conversion for built-in materials and ShaderMaterial

      versionString = '#version 300 es\n';

      prefixVertex =
        [
          'precision mediump sampler2DArray;',
          '#define attribute in',
          '#define varying out',
          '#define texture2D texture'
        ].join('\n') +
        '\n' +
        prefixVertex;

      prefixFragment =
        [
          'precision mediump sampler2DArray;',
          '#define varying in',
          parameters.glslVersion === GLSL3 ?
            ''
          : 'layout(location = 0) out highp vec4 pc_fragColor;',
          parameters.glslVersion === GLSL3 ? '' : '#define gl_FragColor pc_fragColor',
          '#define gl_FragDepthEXT gl_FragDepth',
          '#define texture2D texture',
          '#define textureCube texture',
          '#define texture2DProj textureProj',
          '#define texture2DLodEXT textureLod',
          '#define texture2DProjLodEXT textureProjLod',
          '#define textureCubeLodEXT textureLod',
          '#define texture2DGradEXT textureGrad',
          '#define texture2DProjGradEXT textureProjGrad',
          '#define textureCubeGradEXT textureGrad'
        ].join('\n') +
        '\n' +
        prefixFragment;
    }

    const _vertexGlsl = versionString + prefixVertex + vertexShader;
    const _fragmentGlsl = versionString + prefixFragment + fragmentShader;

    // console.log( '*VERTEX*', vertexGlsl );
    // console.log( '*FRAGMENT*', fragmentGlsl );

    const _glVertexShader = WebGLShader(gl, gl.VERTEX_SHADER, _vertexGlsl);
    const _glFragmentShader = WebGLShader(gl, gl.FRAGMENT_SHADER, _fragmentGlsl);

    gl.attachShader(this.program, _glVertexShader);
    gl.attachShader(this.program, _glFragmentShader);

    // Force a particular attribute to index 0.

    if (parameters.index0AttributeName !== undefined) {
      gl.bindAttribLocation(this.program, 0, parameters.index0AttributeName);
    } else if (parameters.morphTargets === true) {
      // programs with morphTargets displace position out of attribute 0
      gl.bindAttribLocation(this.program, 0, 'position');
    }

    gl.linkProgram(this.program);

    // if the KHR_parallel_shader_compile extension isn't supported,
    // flag the program as ready immediately. It may cause a stall when it's first used.
    this.#programReady = parameters.rendererExtensionParallelShaderCompile === false;

    // diagnostics

    this.#prefixVertex = prefixVertex;
    this.#prefixFragment = prefixFragment;

    // public

    this.type = parameters.shaderType;
    this.name = parameters.shaderName;
    this.cacheKey = cacheKey;
    this.vertexShader = _glVertexShader;
    this.fragmentShader = _glFragmentShader;
  }

  #onFirstUse(self) {
    const gl = this.#gl;
    const renderer = this.#renderer;

    // check for link errors
    if (renderer.debug.checkShaderErrors) {
      const programLog = gl.getProgramInfoLog(this.program).trim();
      const vertexLog = gl.getShaderInfoLog(this.vertexShader).trim();
      const fragmentLog = gl.getShaderInfoLog(this.fragmentShader).trim();

      let runnable = true;
      let haveDiagnostics = true;

      if (gl.getProgramParameter(this.program, gl.LINK_STATUS) === false) {
        runnable = false;

        if (typeof renderer.debug.onShaderError === 'function') {
          renderer.debug.onShaderError(gl, this.program, this.vertexShader, this.fragmentShader);
        } else {
          // default error reporting

          const vertexErrors = _getShaderErrors(gl, this.vertexShader, 'vertex');
          const fragmentErrors = _getShaderErrors(gl, this.fragmentShader, 'fragment');

          console.error(
            `WebGLProgram: Shader Error ${gl.getError()} - VALIDATE_STATUS ${gl.getProgramParameter(
              this.program,
              gl.VALIDATE_STATUS
            )}\n\nProgram Info Log: ${programLog}\n${vertexErrors}\n${fragmentErrors}`
          );
        }
      } else if (programLog !== '') {
        console.warn('WebGLProgram: Program Info Log:', programLog);
      } else if (vertexLog === '' || fragmentLog === '') {
        haveDiagnostics = false;
      }

      if (haveDiagnostics) {
        self.diagnostics = {
          runnable: runnable,

          programLog: programLog,

          vertexShader: {
            log: vertexLog,
            prefix: this.#prefixVertex
          },

          fragmentShader: {
            log: fragmentLog,
            prefix: this.#prefixFragment
          }
        };
      }
    }

    // Clean up

    // Crashes in iOS9 and iOS10. #18402
    // gl.detachShader( program, glVertexShader );
    // gl.detachShader( program, glFragmentShader );

    gl.deleteShader(this.vertexShader);
    gl.deleteShader(this.fragmentShader);

    this.#cachedUniforms = new WebGLUniforms(gl, this.program);
    this.#cachedAttributes = _fetchAttributeLocations(gl, this.program);
  }

  getUniforms() {
    if (this.#cachedUniforms === undefined) {
      // Populates cachedUniforms and cachedAttributes
      this.#onFirstUse(this);
    }

    return this.#cachedUniforms;
  }

  getAttributes() {
    if (this.#cachedAttributes === undefined) {
      // Populates cachedAttributes and cachedUniforms
      this.#onFirstUse(this);
    }

    return this.#cachedAttributes;
  }

  isReady() {
    if (this.#programReady === false) {
      this.#programReady = this.#gl.getProgramParameter(this.program, COMPLETION_STATUS_KHR);
    }

    return this.#programReady;
  }

  destroy() {
    // free resources
    this.#bindingStates.releaseStatesOfProgram(this);

    this.#gl.deleteProgram(this.program);
    this.program = undefined;
  }
}

function _handleSource(string, errorLine) {
  const lines = string.split('\n');
  const lines2 = [];

  const from = Math.max(errorLine - 6, 0);
  const to = Math.min(errorLine + 6, lines.length);

  for (let i = from; i < to; i++) {
    const line = i + 1;
    lines2.push(`${line === errorLine ? '>' : ' '} ${line}: ${lines[i]}`);
  }

  return lines2.join('\n');
}

function _getEncodingComponents(colorSpace) {
  const workingPrimaries = ColorManagement.getPrimaries(ColorManagement.workingColorSpace);
  const encodingPrimaries = ColorManagement.getPrimaries(colorSpace);

  let gamutMapping;

  if (workingPrimaries === encodingPrimaries) {
    gamutMapping = '';
  } else if (workingPrimaries === P3Primaries && encodingPrimaries === Rec709Primaries) {
    gamutMapping = 'LinearDisplayP3ToLinearSRGB';
  } else if (workingPrimaries === Rec709Primaries && encodingPrimaries === P3Primaries) {
    gamutMapping = 'LinearSRGBToLinearDisplayP3';
  }

  switch (colorSpace) {
    case LinearSRGBColorSpace:
    case LinearDisplayP3ColorSpace:
      return [gamutMapping, 'LinearTransferOETF'];

    case SRGBColorSpace:
    case DisplayP3ColorSpace:
      return [gamutMapping, 'sRGBTransferOETF'];

    default:
      console.warn('WebGLProgram: Unsupported color space:', colorSpace);
      return [gamutMapping, 'LinearTransferOETF'];
  }
}

/** @param {WebGL2RenderingContext} gl */
function _getShaderErrors(gl, shader, type) {
  const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  const errors = gl.getShaderInfoLog(shader).trim();

  if (status && errors === '') return '';

  const errorMatches = /ERROR: 0:(\d+)/.exec(errors);
  if (errorMatches) {
    // --enable-privileged-webgl-extension
    // console.log( '**' + type + '**', gl.getExtension( 'WEBGL_debug_shaders' ).getTranslatedShaderSource( shader ) );

    const errorLine = parseInt(errorMatches[1]);
    return `${type.toUpperCase()}\n\n${errors}\n\n${_handleSource(
      gl.getShaderSource(shader),
      errorLine
    )}`;
  } else {
    return errors;
  }
}

function _getTexelEncodingFunction(functionName, colorSpace) {
  const components = _getEncodingComponents(colorSpace);
  // prettier-ignore
  return `vec4 ${functionName}( vec4 value ) { return ${components[ 0 ]}( ${components[ 1 ]}( value ) ); }`;
}

function _getToneMappingFunction(functionName, toneMapping) {
  let toneMappingName;

  switch (toneMapping) {
    case LinearToneMapping:
      toneMappingName = 'Linear';
      break;

    case ReinhardToneMapping:
      toneMappingName = 'Reinhard';
      break;

    case CineonToneMapping:
      toneMappingName = 'OptimizedCineon';
      break;

    case ACESFilmicToneMapping:
      toneMappingName = 'ACESFilmic';
      break;

    case CustomToneMapping:
      toneMappingName = 'Custom';
      break;

    default:
      console.warn('WebGLProgram: Unsupported toneMapping:', toneMapping);
      toneMappingName = 'Linear';
  }

  return `vec3 ${functionName}( vec3 color ) { return ${toneMappingName}ToneMapping( color ); }`;
}

function _generateDefines(defines) {
  const chunks = [];

  for (const name in defines) {
    const value = defines[name];

    if (value === false) continue;

    chunks.push(`#define ${name} ${value}`);
  }

  return chunks.join('\n');
}

/** @param {WebGL2RenderingContext} gl */
function _fetchAttributeLocations(gl, program) {
  const attributes = {};

  const n = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

  for (let i = 0; i < n; i++) {
    const info = gl.getActiveAttrib(program, i);
    const name = info.name;

    let locationSize = 1;
    if (info.type === gl.FLOAT_MAT2) locationSize = 2;
    if (info.type === gl.FLOAT_MAT3) locationSize = 3;
    if (info.type === gl.FLOAT_MAT4) locationSize = 4;

    // console.log( 'WebGLProgram: ACTIVE VERTEX ATTRIBUTE:', name, i );

    attributes[name] = {
      type: info.type,
      location: gl.getAttribLocation(program, name),
      locationSize: locationSize
    };
  }

  return attributes;
}

function _filterEmptyLine(string) {
  return string !== '';
}

function _replaceLightNums(string, parameters) {
  const numSpotLightCoords =
    parameters.numSpotLightShadows +
    parameters.numSpotLightMaps -
    parameters.numSpotLightShadowsWithMaps;

  return string
    .replace(/NUM_DIR_LIGHTS/g, parameters.numDirLights)
    .replace(/NUM_SPOT_LIGHTS/g, parameters.numSpotLights)
    .replace(/NUM_SPOT_LIGHT_MAPS/g, parameters.numSpotLightMaps)
    .replace(/NUM_SPOT_LIGHT_COORDS/g, numSpotLightCoords)
    .replace(/NUM_RECT_AREA_LIGHTS/g, parameters.numRectAreaLights)
    .replace(/NUM_POINT_LIGHTS/g, parameters.numPointLights)
    .replace(/NUM_HEMI_LIGHTS/g, parameters.numHemiLights)
    .replace(/NUM_DIR_LIGHT_SHADOWS/g, parameters.numDirLightShadows)
    .replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, parameters.numSpotLightShadowsWithMaps)
    .replace(/NUM_SPOT_LIGHT_SHADOWS/g, parameters.numSpotLightShadows)
    .replace(/NUM_POINT_LIGHT_SHADOWS/g, parameters.numPointLightShadows);
}

function _replaceClippingPlaneNums(string, parameters) {
  return string
    .replace(/NUM_CLIPPING_PLANES/g, parameters.numClippingPlanes)
    .replace(
      /UNION_CLIPPING_PLANES/g,
      parameters.numClippingPlanes - parameters.numClipIntersection
    );
}

// Resolve Includes

const _includePattern = /^[ \t]*#include +<([\w\d./]+)>/gm;

function _resolveIncludes(string) {
  return string.replace(_includePattern, _includeReplacer);
}

const _shaderChunkMap = new Map([
  ['encodings_fragment', 'colorspace_fragment'], // @deprecated, r154
  ['encodings_pars_fragment', 'colorspace_pars_fragment'], // @deprecated, r154
  ['output_fragment', 'opaque_fragment'] // @deprecated, r154
]);

function _includeReplacer(match, include) {
  let string = ShaderChunk[include];

  if (string === undefined) {
    const newInclude = _shaderChunkMap.get(include);

    if (newInclude !== undefined) {
      string = ShaderChunk[newInclude];
      console.warn(
        `WebGLRenderer: Shader chunk '${include}' has been deprecated. Use '${newInclude}' instead.`
      );
    } else {
      throw new Error(`Can not resolve #include <${include}>`);
    }
  }

  return _resolveIncludes(string);
}

// Unroll Loops

const _unrollLoopPattern =
  /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;

function _unrollLoops(string) {
  return string.replace(_unrollLoopPattern, _loopReplacer);
}

function _loopReplacer(match, start, end, snippet) {
  let string = '';

  for (let i = parseInt(start); i < parseInt(end); i++) {
    string += snippet.replace(/\[\s*i\s*\]/g, `[ ${i} ]`).replace(/UNROLLED_LOOP_INDEX/g, i);
  }

  return string;
}

//

function _generatePrecision(parameters) {
  let precisionString = `precision ${parameters.precision} float;\nprecision ${parameters.precision} int;`;

  if (parameters.precision === 'highp') {
    precisionString += '\n#define HIGH_PRECISION';
  } else if (parameters.precision === 'mediump') {
    precisionString += '\n#define MEDIUM_PRECISION';
  } else if (parameters.precision === 'lowp') {
    precisionString += '\n#define LOW_PRECISION';
  }

  return precisionString;
}

function _generateShadowMapTypeDefine(parameters) {
  let shadowMapTypeDefine = 'SHADOWMAP_TYPE_BASIC';

  if (parameters.shadowMapType === PCFShadowMap) {
    shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF';
  } else if (parameters.shadowMapType === PCFSoftShadowMap) {
    shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF_SOFT';
  } else if (parameters.shadowMapType === VSMShadowMap) {
    shadowMapTypeDefine = 'SHADOWMAP_TYPE_VSM';
  }

  return shadowMapTypeDefine;
}

function _generateEnvMapTypeDefine(parameters) {
  let envMapTypeDefine = 'ENVMAP_TYPE_CUBE';

  if (parameters.envMap) {
    switch (parameters.envMapMode) {
      case CubeReflectionMapping:
      case CubeRefractionMapping:
        envMapTypeDefine = 'ENVMAP_TYPE_CUBE';
        break;

      case CubeUVReflectionMapping:
        envMapTypeDefine = 'ENVMAP_TYPE_CUBE_UV';
        break;
    }
  }

  return envMapTypeDefine;
}

function _generateEnvMapModeDefine(parameters) {
  let envMapModeDefine = 'ENVMAP_MODE_REFLECTION';

  if (parameters.envMap) {
    switch (parameters.envMapMode) {
      case CubeRefractionMapping:
        envMapModeDefine = 'ENVMAP_MODE_REFRACTION';
        break;
    }
  }

  return envMapModeDefine;
}

function _generateEnvMapBlendingDefine(parameters) {
  let envMapBlendingDefine = 'ENVMAP_BLENDING_NONE';

  if (parameters.envMap) {
    switch (parameters.combine) {
      case MultiplyOperation:
        envMapBlendingDefine = 'ENVMAP_BLENDING_MULTIPLY';
        break;

      case MixOperation:
        envMapBlendingDefine = 'ENVMAP_BLENDING_MIX';
        break;

      case AddOperation:
        envMapBlendingDefine = 'ENVMAP_BLENDING_ADD';
        break;
    }
  }

  return envMapBlendingDefine;
}

function _generateCubeUVSize(parameters) {
  const imageHeight = parameters.envMapCubeUVHeight;

  if (imageHeight === null) return null;

  const maxMip = Math.log2(imageHeight) - 2;

  const texelHeight = 1.0 / imageHeight;

  const texelWidth = 1.0 / (3 * Math.max(Math.pow(2, maxMip), 7 * 16));

  return { texelWidth, texelHeight, maxMip };
}

// From https://www.khronos.org/registry/webgl/extensions/KHR_parallel_shader_compile/
const COMPLETION_STATUS_KHR = 0x91b1;

let _programIdCount = 0;

export { WebGLProgram };
