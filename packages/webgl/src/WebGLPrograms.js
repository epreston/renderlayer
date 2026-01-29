import { Layers } from '@renderlayer/core';
import { ColorManagement } from '@renderlayer/math';
import { ShaderLib, cloneUniforms } from '@renderlayer/shaders';
import {
  BackSide,
  CubeUVReflectionMapping,
  DoubleSide,
  LinearSRGBColorSpace,
  NoToneMapping,
  NormalBlending,
  ObjectSpaceNormalMap,
  SRGBTransfer,
  TangentSpaceNormalMap
} from '@renderlayer/shared';

import { WebGLProgram } from './WebGLProgram.js';
import { WebGLShaderCache } from './WebGLShaderCache.js';

/**
 * @import { WebGLRenderer } from "@renderlayer/renderers"
 * @import { WebGLCubeMaps, WebGLCubeUVMaps } from "@renderlayer/webgl"
 * @import { WebGLExtensions, WebGLCapabilities } from "@renderlayer/webgl"
 * @import { WebGLBindingStates, WebGLClipping } from "@renderlayer/webgl"
 */

class WebGLPrograms {
  #renderer;
  #cubemaps;
  #cubeuvmaps;
  #extensions;
  #capabilities;
  #bindingStates;
  #clipping;

  #programLayers = new Layers();
  #customShaders = new WebGLShaderCache();

  #logarithmicDepthBuffer;
  #SUPPORTS_VERTEX_TEXTURES;

  #precision;

  #shaderIDs = {
    MeshDepthMaterial: 'depth',
    MeshDistanceMaterial: 'distanceRGBA',
    MeshNormalMaterial: 'normal',
    MeshBasicMaterial: 'basic',
    // MeshLambertMaterial: 'lambert',
    // MeshPhongMaterial: 'phong',
    // MeshToonMaterial: 'toon',
    MeshStandardMaterial: 'physical',
    MeshPhysicalMaterial: 'physical',
    // MeshMatcapMaterial: 'matcap',
    LineBasicMaterial: 'basic',
    // LineDashedMaterial: 'dashed',
    PointsMaterial: 'points',
    ShadowMaterial: 'shadow',
    SpriteMaterial: 'sprite'
  };

  // Exposed for resource monitoring & error feedback via renderer.info:
  programs = [];

  /**
   * @param {WebGLRenderer} renderer
   * @param {WebGLCubeMaps} cubemaps
   * @param {WebGLCubeUVMaps} cubeuvmaps
   * @param {WebGLExtensions} extensions
   * @param {WebGLCapabilities} capabilities
   * @param {WebGLBindingStates} bindingStates
   * @param {WebGLClipping} clipping
   */
  constructor(renderer, cubemaps, cubeuvmaps, extensions, capabilities, bindingStates, clipping) {
    this.#renderer = renderer;
    this.#cubemaps = cubemaps;
    this.#cubeuvmaps = cubeuvmaps;
    this.#extensions = extensions;
    this.#capabilities = capabilities;
    this.#bindingStates = bindingStates;
    this.#clipping = clipping;

    this.#logarithmicDepthBuffer = capabilities.logarithmicDepthBuffer;
    this.#SUPPORTS_VERTEX_TEXTURES = capabilities.vertexTextures;

    this.#precision = capabilities.precision;
  }

  #getChannel(value) {
    if (value === 0) return 'uv';

    return `uv${value}`;
  }

  getParameters(material, lights, shadows, scene, object) {
    const renderer = this.#renderer;

    const fog = scene.fog;
    const geometry = object.geometry;
    const environment = material.isMeshStandardMaterial ? scene.environment : null;

    const envMap = (material.isMeshStandardMaterial ? this.#cubeuvmaps : this.#cubemaps).get(
      material.envMap || environment
    );
    const envMapCubeUVHeight =
      !!envMap && envMap.mapping === CubeUVReflectionMapping ? envMap.image.height : null;

    const shaderID = this.#shaderIDs[material.type];

    // heuristics to create shader parameters according to lights in the scene
    // (not to blow over maxLights budget)

    if (material.precision !== null) {
      this.#precision = this.#capabilities.getMaxPrecision(material.precision);

      if (this.#precision !== material.precision) {
        console.warn(
          `WebGLProgram.getParameters: ${material.precision} not supported, using ${this.#precision} instead.`
        );
      }
    }

    //

    const morphAttribute =
      geometry.morphAttributes.position ||
      geometry.morphAttributes.normal ||
      geometry.morphAttributes.color;
    const morphTargetsCount = morphAttribute !== undefined ? morphAttribute.length : 0;

    let morphTextureStride = 0;

    if (geometry.morphAttributes.position !== undefined) morphTextureStride = 1;
    if (geometry.morphAttributes.normal !== undefined) morphTextureStride = 2;
    if (geometry.morphAttributes.color !== undefined) morphTextureStride = 3;

    //

    let vertexShader;

    let fragmentShader;
    let customVertexShaderID;
    let customFragmentShaderID;

    if (shaderID) {
      const shader = ShaderLib[shaderID];

      vertexShader = shader.vertexShader;
      fragmentShader = shader.fragmentShader;
    } else {
      vertexShader = material.vertexShader;
      fragmentShader = material.fragmentShader;

      this.#customShaders.update(material);

      customVertexShaderID = this.#customShaders.getVertexShaderID(material);
      customFragmentShaderID = this.#customShaders.getFragmentShaderID(material);
    }

    const currentRenderTarget = renderer.getRenderTarget();

    const IS_INSTANCEDMESH = object.isInstancedMesh === true;

    const HAS_MAP = !!material.map;
    const HAS_MATCAP = !!material.matcap;
    const HAS_ENVMAP = !!envMap;
    const HAS_AOMAP = !!material.aoMap;
    const HAS_LIGHTMAP = !!material.lightMap;
    const HAS_BUMPMAP = !!material.bumpMap;
    const HAS_NORMALMAP = !!material.normalMap;
    const HAS_DISPLACEMENTMAP = !!material.displacementMap;
    const HAS_EMISSIVEMAP = !!material.emissiveMap;

    const HAS_METALNESSMAP = !!material.metalnessMap;
    const HAS_ROUGHNESSMAP = !!material.roughnessMap;

    const HAS_ANISOTROPY = material.anisotropy > 0;
    const HAS_CLEARCOAT = material.clearcoat > 0;
    const HAS_IRIDESCENCE = material.iridescence > 0;
    const HAS_SHEEN = material.sheen > 0;
    const HAS_TRANSMISSION = material.transmission > 0;

    const HAS_ANISOTROPYMAP = HAS_ANISOTROPY && !!material.anisotropyMap;

    const HAS_CLEARCOATMAP = HAS_CLEARCOAT && !!material.clearcoatMap;
    const HAS_CLEARCOAT_NORMALMAP = HAS_CLEARCOAT && !!material.clearcoatNormalMap;
    const HAS_CLEARCOAT_ROUGHNESSMAP = HAS_CLEARCOAT && !!material.clearcoatRoughnessMap;

    const HAS_IRIDESCENCEMAP = HAS_IRIDESCENCE && !!material.iridescenceMap;
    const HAS_IRIDESCENCE_THICKNESSMAP = HAS_IRIDESCENCE && !!material.iridescenceThicknessMap;

    const HAS_SHEEN_COLORMAP = HAS_SHEEN && !!material.sheenColorMap;
    const HAS_SHEEN_ROUGHNESSMAP = HAS_SHEEN && !!material.sheenRoughnessMap;

    const HAS_SPECULARMAP = !!material.specularMap;
    const HAS_SPECULAR_COLORMAP = !!material.specularColorMap;
    const HAS_SPECULAR_INTENSITYMAP = !!material.specularIntensityMap;

    const HAS_TRANSMISSIONMAP = HAS_TRANSMISSION && !!material.transmissionMap;
    const HAS_THICKNESSMAP = HAS_TRANSMISSION && !!material.thicknessMap;

    const HAS_GRADIENTMAP = !!material.gradientMap;

    const HAS_ALPHAMAP = !!material.alphaMap;

    const HAS_ALPHATEST = material.alphaTest > 0;

    const HAS_ALPHAHASH = !!material.alphaHash;

    const HAS_EXTENSIONS = !!material.extensions;

    const HAS_ATTRIBUTE_UV1 = !!geometry.attributes.uv1;
    const HAS_ATTRIBUTE_UV2 = !!geometry.attributes.uv2;
    const HAS_ATTRIBUTE_UV3 = !!geometry.attributes.uv3;

    let toneMapping = NoToneMapping;

    if (material.toneMapped) {
      if (currentRenderTarget === null || currentRenderTarget.isXRRenderTarget === true) {
        toneMapping = renderer.toneMapping;
      }
    }

    const parameters = {
      isWebGL2: true, // EP: optimise

      shaderID,
      shaderType: material.type,
      shaderName: material.name,

      vertexShader,
      fragmentShader,
      defines: material.defines,

      customVertexShaderID,
      customFragmentShaderID,

      isRawShaderMaterial: material.isRawShaderMaterial === true,
      glslVersion: material.glslVersion,

      precision: this.#precision,

      instancing: IS_INSTANCEDMESH,
      instancingColor: IS_INSTANCEDMESH && object.instanceColor !== null,

      supportsVertexTextures: this.#SUPPORTS_VERTEX_TEXTURES,
      outputColorSpace:
        currentRenderTarget === null ? renderer.outputColorSpace
        : currentRenderTarget.isXRRenderTarget === true ? currentRenderTarget.texture.colorSpace
        : LinearSRGBColorSpace,

      map: HAS_MAP,
      matcap: HAS_MATCAP,
      envMap: HAS_ENVMAP,
      envMapMode: HAS_ENVMAP && envMap.mapping,
      envMapCubeUVHeight,
      aoMap: HAS_AOMAP,
      lightMap: HAS_LIGHTMAP,
      bumpMap: HAS_BUMPMAP,
      normalMap: HAS_NORMALMAP,
      displacementMap: this.#SUPPORTS_VERTEX_TEXTURES && HAS_DISPLACEMENTMAP,
      emissiveMap: HAS_EMISSIVEMAP,

      normalMapObjectSpace: HAS_NORMALMAP && material.normalMapType === ObjectSpaceNormalMap,
      normalMapTangentSpace: HAS_NORMALMAP && material.normalMapType === TangentSpaceNormalMap,

      metalnessMap: HAS_METALNESSMAP,
      roughnessMap: HAS_ROUGHNESSMAP,

      anisotropy: HAS_ANISOTROPY,
      anisotropyMap: HAS_ANISOTROPYMAP,

      clearcoat: HAS_CLEARCOAT,
      clearcoatMap: HAS_CLEARCOATMAP,
      clearcoatNormalMap: HAS_CLEARCOAT_NORMALMAP,
      clearcoatRoughnessMap: HAS_CLEARCOAT_ROUGHNESSMAP,

      iridescence: HAS_IRIDESCENCE,
      iridescenceMap: HAS_IRIDESCENCEMAP,
      iridescenceThicknessMap: HAS_IRIDESCENCE_THICKNESSMAP,

      sheen: HAS_SHEEN,
      sheenColorMap: HAS_SHEEN_COLORMAP,
      sheenRoughnessMap: HAS_SHEEN_ROUGHNESSMAP,

      specularMap: HAS_SPECULARMAP,
      specularColorMap: HAS_SPECULAR_COLORMAP,
      specularIntensityMap: HAS_SPECULAR_INTENSITYMAP,

      transmission: HAS_TRANSMISSION,
      transmissionMap: HAS_TRANSMISSIONMAP,
      thicknessMap: HAS_THICKNESSMAP,

      gradientMap: HAS_GRADIENTMAP,

      opaque: material.transparent === false && material.blending === NormalBlending,

      alphaMap: HAS_ALPHAMAP,
      alphaTest: HAS_ALPHATEST,
      alphaHash: HAS_ALPHAHASH,

      combine: material.combine,

      //

      mapUv: HAS_MAP && this.#getChannel(material.map.channel),
      aoMapUv: HAS_AOMAP && this.#getChannel(material.aoMap.channel),
      lightMapUv: HAS_LIGHTMAP && this.#getChannel(material.lightMap.channel),
      bumpMapUv: HAS_BUMPMAP && this.#getChannel(material.bumpMap.channel),
      normalMapUv: HAS_NORMALMAP && this.#getChannel(material.normalMap.channel),
      displacementMapUv: HAS_DISPLACEMENTMAP && this.#getChannel(material.displacementMap.channel),
      emissiveMapUv: HAS_EMISSIVEMAP && this.#getChannel(material.emissiveMap.channel),

      metalnessMapUv: HAS_METALNESSMAP && this.#getChannel(material.metalnessMap.channel),
      roughnessMapUv: HAS_ROUGHNESSMAP && this.#getChannel(material.roughnessMap.channel),

      anisotropyMapUv: HAS_ANISOTROPYMAP && this.#getChannel(material.anisotropyMap.channel),

      clearcoatMapUv: HAS_CLEARCOATMAP && this.#getChannel(material.clearcoatMap.channel),
      clearcoatNormalMapUv:
        HAS_CLEARCOAT_NORMALMAP && this.#getChannel(material.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv:
        HAS_CLEARCOAT_ROUGHNESSMAP && this.#getChannel(material.clearcoatRoughnessMap.channel),

      iridescenceMapUv: HAS_IRIDESCENCEMAP && this.#getChannel(material.iridescenceMap.channel),
      iridescenceThicknessMapUv:
        HAS_IRIDESCENCE_THICKNESSMAP && this.#getChannel(material.iridescenceThicknessMap.channel),

      sheenColorMapUv: HAS_SHEEN_COLORMAP && this.#getChannel(material.sheenColorMap.channel),
      sheenRoughnessMapUv:
        HAS_SHEEN_ROUGHNESSMAP && this.#getChannel(material.sheenRoughnessMap.channel),

      specularMapUv: HAS_SPECULARMAP && this.#getChannel(material.specularMap.channel),
      specularColorMapUv:
        HAS_SPECULAR_COLORMAP && this.#getChannel(material.specularColorMap.channel),
      specularIntensityMapUv:
        HAS_SPECULAR_INTENSITYMAP && this.#getChannel(material.specularIntensityMap.channel),

      transmissionMapUv: HAS_TRANSMISSIONMAP && this.#getChannel(material.transmissionMap.channel),
      thicknessMapUv: HAS_THICKNESSMAP && this.#getChannel(material.thicknessMap.channel),

      alphaMapUv: HAS_ALPHAMAP && this.#getChannel(material.alphaMap.channel),

      //

      vertexTangents: !!geometry.attributes.tangent && (HAS_NORMALMAP || HAS_ANISOTROPY),
      vertexColors: material.vertexColors,
      vertexAlphas:
        material.vertexColors === true &&
        !!geometry.attributes.color &&
        geometry.attributes.color.itemSize === 4,
      vertexUv1s: HAS_ATTRIBUTE_UV1,
      vertexUv2s: HAS_ATTRIBUTE_UV2,
      vertexUv3s: HAS_ATTRIBUTE_UV3,

      pointsUvs: object.isPoints === true && !!geometry.attributes.uv && (HAS_MAP || HAS_ALPHAMAP),

      fog: !!fog,
      useFog: material.fog === true,
      fogExp2: fog && fog.isFogExp2,

      flatShading: material.flatShading === true,

      sizeAttenuation: material.sizeAttenuation === true,
      logarithmicDepthBuffer: this.#logarithmicDepthBuffer,

      skinning: object.isSkinnedMesh === true,

      morphTargets: geometry.morphAttributes.position !== undefined,
      morphNormals: geometry.morphAttributes.normal !== undefined,
      morphColors: geometry.morphAttributes.color !== undefined,
      morphTargetsCount,
      morphTextureStride,

      numDirLights: lights.directional.length,
      numPointLights: lights.point.length,
      numSpotLights: lights.spot.length,
      numSpotLightMaps: lights.spotLightMap.length,
      numRectAreaLights: lights.rectArea.length,
      numHemiLights: lights.hemi.length,

      numDirLightShadows: lights.directionalShadowMap.length,
      numPointLightShadows: lights.pointShadowMap.length,
      numSpotLightShadows: lights.spotShadowMap.length,
      numSpotLightShadowsWithMaps: lights.numSpotLightShadowsWithMaps,

      numLightProbes: lights.numLightProbes,

      numClippingPlanes: this.#clipping.numPlanes,
      numClipIntersection: this.#clipping.numIntersection,

      dithering: material.dithering,

      shadowMapEnabled: renderer.shadowMap.enabled && shadows.length > 0,
      shadowMapType: renderer.shadowMap.type,

      toneMapping,
      useLegacyLights: renderer._useLegacyLights,

      decodeVideoTexture:
        HAS_MAP &&
        material.map.isVideoTexture === true &&
        ColorManagement.getTransfer(material.map.colorSpace) === SRGBTransfer,

      premultipliedAlpha: material.premultipliedAlpha,

      doubleSided: material.side === DoubleSide,
      flipSided: material.side === BackSide,

      useDepthPacking: material.depthPacking >= 0,
      depthPacking: material.depthPacking || 0,

      index0AttributeName: material.index0AttributeName,

      extensionDerivatives: HAS_EXTENSIONS && material.extensions.derivatives === true,
      extensionFragDepth: HAS_EXTENSIONS && material.extensions.fragDepth === true,
      extensionDrawBuffers: HAS_EXTENSIONS && material.extensions.drawBuffers === true,
      extensionShaderTextureLOD: HAS_EXTENSIONS && material.extensions.shaderTextureLOD === true,

      rendererExtensionFragDepth: true, // EP: always true in webgl2, optimise
      rendererExtensionDrawBuffers: true,
      rendererExtensionShaderTextureLod: true,
      rendererExtensionParallelShaderCompile: this.#extensions.has('KHR_parallel_shader_compile'),

      customProgramCacheKey: material.customProgramCacheKey()
    };

    return parameters;
  }

  getProgramCacheKey(parameters) {
    const array = [];

    if (parameters.shaderID) {
      array.push(parameters.shaderID);
    } else {
      array.push(parameters.customVertexShaderID);
      array.push(parameters.customFragmentShaderID);
    }

    if (parameters.defines !== undefined) {
      for (const name in parameters.defines) {
        array.push(name);
        array.push(parameters.defines[name]);
      }
    }

    if (parameters.isRawShaderMaterial === false) {
      this.#getProgramCacheKeyParameters(array, parameters);
      this.#getProgramCacheKeyBooleans(array, parameters);
      array.push(this.#renderer.outputColorSpace);
    }

    array.push(parameters.customProgramCacheKey);

    return array.join();
  }

  #getProgramCacheKeyParameters(array, parameters) {
    array.push(parameters.precision);
    array.push(parameters.outputColorSpace);
    array.push(parameters.envMapMode);
    array.push(parameters.envMapCubeUVHeight);
    array.push(parameters.mapUv);
    array.push(parameters.alphaMapUv);
    array.push(parameters.lightMapUv);
    array.push(parameters.aoMapUv);
    array.push(parameters.bumpMapUv);
    array.push(parameters.normalMapUv);
    array.push(parameters.displacementMapUv);
    array.push(parameters.emissiveMapUv);
    array.push(parameters.metalnessMapUv);
    array.push(parameters.roughnessMapUv);
    array.push(parameters.anisotropyMapUv);
    array.push(parameters.clearcoatMapUv);
    array.push(parameters.clearcoatNormalMapUv);
    array.push(parameters.clearcoatRoughnessMapUv);
    array.push(parameters.iridescenceMapUv);
    array.push(parameters.iridescenceThicknessMapUv);
    array.push(parameters.sheenColorMapUv);
    array.push(parameters.sheenRoughnessMapUv);
    array.push(parameters.specularMapUv);
    array.push(parameters.specularColorMapUv);
    array.push(parameters.specularIntensityMapUv);
    array.push(parameters.transmissionMapUv);
    array.push(parameters.thicknessMapUv);
    array.push(parameters.combine);
    array.push(parameters.fogExp2);
    array.push(parameters.sizeAttenuation);
    array.push(parameters.morphTargetsCount);
    array.push(parameters.morphAttributeCount);
    array.push(parameters.numDirLights);
    array.push(parameters.numPointLights);
    array.push(parameters.numSpotLights);
    array.push(parameters.numSpotLightMaps);
    array.push(parameters.numHemiLights);
    array.push(parameters.numRectAreaLights);
    array.push(parameters.numDirLightShadows);
    array.push(parameters.numPointLightShadows);
    array.push(parameters.numSpotLightShadows);
    array.push(parameters.numSpotLightShadowsWithMaps);
    array.push(parameters.numLightProbes);
    array.push(parameters.shadowMapType);
    array.push(parameters.toneMapping);
    array.push(parameters.numClippingPlanes);
    array.push(parameters.numClipIntersection);
    array.push(parameters.depthPacking);
  }

  #getProgramCacheKeyBooleans(array, parameters) {
    this.#programLayers.disableAll();

    if (parameters.isWebGL2) this.#programLayers.enable(0);
    if (parameters.supportsVertexTextures) this.#programLayers.enable(1);
    if (parameters.instancing) this.#programLayers.enable(2);
    if (parameters.instancingColor) this.#programLayers.enable(3);
    if (parameters.matcap) this.#programLayers.enable(4);
    if (parameters.envMap) this.#programLayers.enable(5);
    if (parameters.normalMapObjectSpace) this.#programLayers.enable(6);
    if (parameters.normalMapTangentSpace) this.#programLayers.enable(7);
    if (parameters.clearcoat) this.#programLayers.enable(8);
    if (parameters.iridescence) this.#programLayers.enable(9);
    if (parameters.alphaTest) this.#programLayers.enable(10);
    if (parameters.vertexColors) this.#programLayers.enable(11);
    if (parameters.vertexAlphas) this.#programLayers.enable(12);
    if (parameters.vertexUv1s) this.#programLayers.enable(13);
    if (parameters.vertexUv2s) this.#programLayers.enable(14);
    if (parameters.vertexUv3s) this.#programLayers.enable(15);
    if (parameters.vertexTangents) this.#programLayers.enable(16);
    if (parameters.anisotropy) this.#programLayers.enable(17);
    if (parameters.alphaHash) this.#programLayers.enable(18);

    array.push(this.#programLayers.mask);
    this.#programLayers.disableAll();

    if (parameters.fog) this.#programLayers.enable(0);
    if (parameters.useFog) this.#programLayers.enable(1);
    if (parameters.flatShading) this.#programLayers.enable(2);
    if (parameters.logarithmicDepthBuffer) this.#programLayers.enable(3);
    if (parameters.skinning) this.#programLayers.enable(4);
    if (parameters.morphTargets) this.#programLayers.enable(5);
    if (parameters.morphNormals) this.#programLayers.enable(6);
    if (parameters.morphColors) this.#programLayers.enable(7);
    if (parameters.premultipliedAlpha) this.#programLayers.enable(8);
    if (parameters.shadowMapEnabled) this.#programLayers.enable(9);
    if (parameters.useLegacyLights) this.#programLayers.enable(10);
    if (parameters.doubleSided) this.#programLayers.enable(11);
    if (parameters.flipSided) this.#programLayers.enable(12);
    if (parameters.useDepthPacking) this.#programLayers.enable(13);
    if (parameters.dithering) this.#programLayers.enable(14);
    if (parameters.transmission) this.#programLayers.enable(15);
    if (parameters.sheen) this.#programLayers.enable(16);
    if (parameters.opaque) this.#programLayers.enable(17);
    if (parameters.pointsUvs) this.#programLayers.enable(18);
    if (parameters.decodeVideoTexture) this.#programLayers.enable(19);

    array.push(this.#programLayers.mask);
  }

  getUniforms(material) {
    const shaderID = this.#shaderIDs[material.type];
    let uniforms;

    if (shaderID) {
      const shader = ShaderLib[shaderID];
      uniforms = cloneUniforms(shader.uniforms);
    } else {
      uniforms = material.uniforms;
    }

    return uniforms;
  }

  acquireProgram(parameters, cacheKey) {
    let program;

    // Check if code has been already compiled
    for (let p = 0, pl = this.programs.length; p < pl; p++) {
      const preexistingProgram = this.programs[p];

      if (preexistingProgram.cacheKey === cacheKey) {
        program = preexistingProgram;
        ++program.usedTimes;

        break;
      }
    }

    if (program === undefined) {
      program = new WebGLProgram(this.#renderer, cacheKey, parameters, this.#bindingStates);
      this.programs.push(program);
    }

    return program;
  }

  releaseProgram(program) {
    if (--program.usedTimes === 0) {
      // Remove from unordered set
      const i = this.programs.indexOf(program);
      this.programs[i] = this.programs[this.programs.length - 1];
      this.programs.pop();

      // Free WebGL resources
      program.destroy();
    }
  }

  releaseShaderCache(material) {
    this.#customShaders.remove(material);
  }

  dispose() {
    this.#customShaders.dispose();
  }
}

export { WebGLPrograms };
