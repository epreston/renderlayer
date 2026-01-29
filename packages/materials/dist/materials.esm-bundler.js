import { generateUUID, Color, Vector2, clamp } from '@renderlayer/math';
import { NormalBlending, FrontSide, SrcAlphaFactor, OneMinusSrcAlphaFactor, AddEquation, LessEqualDepth, AlwaysStencilFunc, KeepStencilOp, MultiplyOperation, BasicDepthPacking, TangentSpaceNormalMap } from '@renderlayer/shared';
import { EventDispatcher } from '@renderlayer/core';
import { cloneUniforms, cloneUniformsGroups } from '@renderlayer/shaders';

class Material extends EventDispatcher {
  #id = _materialId++;
  uuid = generateUUID();
  name = "";
  type = "Material";
  blending = NormalBlending;
  side = FrontSide;
  vertexColors = false;
  opacity = 1;
  transparent = false;
  alphaHash = false;
  blendSrc = SrcAlphaFactor;
  blendDst = OneMinusSrcAlphaFactor;
  blendEquation = AddEquation;
  blendSrcAlpha = null;
  blendDstAlpha = null;
  blendEquationAlpha = null;
  blendColor = new Color(0, 0, 0);
  blendAlpha = 0;
  depthFunc = LessEqualDepth;
  depthTest = true;
  depthWrite = true;
  stencilWriteMask = 255;
  stencilFunc = AlwaysStencilFunc;
  stencilRef = 0;
  stencilFuncMask = 255;
  stencilFail = KeepStencilOp;
  stencilZFail = KeepStencilOp;
  stencilZPass = KeepStencilOp;
  stencilWrite = false;
  clippingPlanes = null;
  clipIntersection = false;
  clipShadows = false;
  shadowSide = null;
  colorWrite = true;
  // override the renderer's default precision for this material
  precision = null;
  polygonOffset = false;
  polygonOffsetFactor = 0;
  polygonOffsetUnits = 0;
  dithering = false;
  alphaToCoverage = false;
  premultipliedAlpha = false;
  forceSinglePass = false;
  visible = true;
  toneMapped = true;
  userData = {};
  version = 0;
  #alphaTest = 0;
  constructor() {
    super();
  }
  get isMaterial() {
    return true;
  }
  get id() {
    return this.#id;
  }
  get alphaTest() {
    return this.#alphaTest;
  }
  set alphaTest(value) {
    if (this.#alphaTest > 0 !== value > 0) {
      this.version++;
    }
    this.#alphaTest = value;
  }
  set needsUpdate(value) {
    if (value === true) this.version++;
  }
  onBuild() {
  }
  onBeforeRender() {
  }
  onBeforeCompile() {
  }
  customProgramCacheKey() {
    return this.onBeforeCompile.toString();
  }
  setValues(values) {
    if (values === void 0) return;
    for (const key in values) {
      const newValue = values[key];
      if (newValue === void 0) {
        console.warn(`Material: parameter '${key}' has value of undefined.`);
        continue;
      }
      const currentValue = this[key];
      if (currentValue === void 0) {
        console.warn(`Material: '${key}' is not a property of ${this.type}.`);
        continue;
      }
      if (currentValue && currentValue.isColor) {
        currentValue.set(newValue);
      } else if (currentValue && currentValue.isVector3 && newValue && newValue.isVector3) {
        currentValue.copy(newValue);
      } else {
        this[key] = newValue;
      }
    }
  }
  toJSON(meta) {
    const isRootObject = meta === void 0 || typeof meta === "string";
    if (isRootObject) {
      meta = {
        textures: {},
        images: {}
      };
    }
    const data = {
      metadata: {
        version: 4.5,
        type: "Material",
        generator: "Material.toJSON"
      }
    };
    data.uuid = this.uuid;
    data.type = this.type;
    if (this.name !== "") data.name = this.name;
    if (this.color && this.color.isColor) data.color = this.color.getHex();
    if (this.roughness !== void 0) data.roughness = this.roughness;
    if (this.metalness !== void 0) data.metalness = this.metalness;
    if (this.sheen !== void 0) data.sheen = this.sheen;
    if (this.sheenColor && this.sheenColor.isColor) data.sheenColor = this.sheenColor.getHex();
    if (this.sheenRoughness !== void 0) data.sheenRoughness = this.sheenRoughness;
    if (this.emissive && this.emissive.isColor) data.emissive = this.emissive.getHex();
    if (this.emissiveIntensity && this.emissiveIntensity !== 1)
      data.emissiveIntensity = this.emissiveIntensity;
    if (this.specular && this.specular.isColor) data.specular = this.specular.getHex();
    if (this.specularIntensity !== void 0) data.specularIntensity = this.specularIntensity;
    if (this.specularColor && this.specularColor.isColor)
      data.specularColor = this.specularColor.getHex();
    if (this.shininess !== void 0) data.shininess = this.shininess;
    if (this.clearcoat !== void 0) data.clearcoat = this.clearcoat;
    if (this.clearcoatRoughness !== void 0) data.clearcoatRoughness = this.clearcoatRoughness;
    if (this.clearcoatMap && this.clearcoatMap.isTexture) {
      data.clearcoatMap = this.clearcoatMap.toJSON(meta).uuid;
    }
    if (this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture) {
      data.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(meta).uuid;
    }
    if (this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture) {
      data.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(meta).uuid;
      data.clearcoatNormalScale = this.clearcoatNormalScale.toArray();
    }
    if (this.iridescence !== void 0) data.iridescence = this.iridescence;
    if (this.iridescenceIOR !== void 0) data.iridescenceIOR = this.iridescenceIOR;
    if (this.iridescenceThicknessRange !== void 0)
      data.iridescenceThicknessRange = this.iridescenceThicknessRange;
    if (this.iridescenceMap && this.iridescenceMap.isTexture) {
      data.iridescenceMap = this.iridescenceMap.toJSON(meta).uuid;
    }
    if (this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture) {
      data.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(meta).uuid;
    }
    if (this.anisotropy !== void 0) data.anisotropy = this.anisotropy;
    if (this.anisotropyRotation !== void 0) data.anisotropyRotation = this.anisotropyRotation;
    if (this.anisotropyMap && this.anisotropyMap.isTexture) {
      data.anisotropyMap = this.anisotropyMap.toJSON(meta).uuid;
    }
    if (this.map && this.map.isTexture) data.map = this.map.toJSON(meta).uuid;
    if (this.matcap && this.matcap.isTexture) data.matcap = this.matcap.toJSON(meta).uuid;
    if (this.alphaMap && this.alphaMap.isTexture) data.alphaMap = this.alphaMap.toJSON(meta).uuid;
    if (this.lightMap && this.lightMap.isTexture) {
      data.lightMap = this.lightMap.toJSON(meta).uuid;
      data.lightMapIntensity = this.lightMapIntensity;
    }
    if (this.aoMap && this.aoMap.isTexture) {
      data.aoMap = this.aoMap.toJSON(meta).uuid;
      data.aoMapIntensity = this.aoMapIntensity;
    }
    if (this.bumpMap && this.bumpMap.isTexture) {
      data.bumpMap = this.bumpMap.toJSON(meta).uuid;
      data.bumpScale = this.bumpScale;
    }
    if (this.normalMap && this.normalMap.isTexture) {
      data.normalMap = this.normalMap.toJSON(meta).uuid;
      data.normalMapType = this.normalMapType;
      data.normalScale = this.normalScale.toArray();
    }
    if (this.displacementMap && this.displacementMap.isTexture) {
      data.displacementMap = this.displacementMap.toJSON(meta).uuid;
      data.displacementScale = this.displacementScale;
      data.displacementBias = this.displacementBias;
    }
    if (this.roughnessMap && this.roughnessMap.isTexture)
      data.roughnessMap = this.roughnessMap.toJSON(meta).uuid;
    if (this.metalnessMap && this.metalnessMap.isTexture)
      data.metalnessMap = this.metalnessMap.toJSON(meta).uuid;
    if (this.emissiveMap && this.emissiveMap.isTexture)
      data.emissiveMap = this.emissiveMap.toJSON(meta).uuid;
    if (this.specularMap && this.specularMap.isTexture)
      data.specularMap = this.specularMap.toJSON(meta).uuid;
    if (this.specularIntensityMap && this.specularIntensityMap.isTexture)
      data.specularIntensityMap = this.specularIntensityMap.toJSON(meta).uuid;
    if (this.specularColorMap && this.specularColorMap.isTexture)
      data.specularColorMap = this.specularColorMap.toJSON(meta).uuid;
    if (this.envMap && this.envMap.isTexture) {
      data.envMap = this.envMap.toJSON(meta).uuid;
      if (this.combine !== void 0) data.combine = this.combine;
    }
    if (this.envMapIntensity !== void 0) data.envMapIntensity = this.envMapIntensity;
    if (this.reflectivity !== void 0) data.reflectivity = this.reflectivity;
    if (this.refractionRatio !== void 0) data.refractionRatio = this.refractionRatio;
    if (this.gradientMap && this.gradientMap.isTexture) {
      data.gradientMap = this.gradientMap.toJSON(meta).uuid;
    }
    if (this.transmission !== void 0) data.transmission = this.transmission;
    if (this.transmissionMap && this.transmissionMap.isTexture)
      data.transmissionMap = this.transmissionMap.toJSON(meta).uuid;
    if (this.thickness !== void 0) data.thickness = this.thickness;
    if (this.thicknessMap && this.thicknessMap.isTexture)
      data.thicknessMap = this.thicknessMap.toJSON(meta).uuid;
    if (this.attenuationDistance !== void 0 && this.attenuationDistance !== Infinity)
      data.attenuationDistance = this.attenuationDistance;
    if (this.attenuationColor !== void 0) data.attenuationColor = this.attenuationColor.getHex();
    if (this.size !== void 0) data.size = this.size;
    if (this.shadowSide !== null) data.shadowSide = this.shadowSide;
    if (this.sizeAttenuation !== void 0) data.sizeAttenuation = this.sizeAttenuation;
    if (this.blending !== NormalBlending) data.blending = this.blending;
    if (this.side !== FrontSide) data.side = this.side;
    if (this.vertexColors === true) data.vertexColors = true;
    if (this.opacity < 1) data.opacity = this.opacity;
    if (this.transparent === true) data.transparent = true;
    if (this.blendSrc !== SrcAlphaFactor) data.blendSrc = this.blendSrc;
    if (this.blendDst !== OneMinusSrcAlphaFactor) data.blendDst = this.blendDst;
    if (this.blendEquation !== AddEquation) data.blendEquation = this.blendEquation;
    if (this.blendSrcAlpha !== null) data.blendSrcAlpha = this.blendSrcAlpha;
    if (this.blendDstAlpha !== null) data.blendDstAlpha = this.blendDstAlpha;
    if (this.blendEquationAlpha !== null) data.blendEquationAlpha = this.blendEquationAlpha;
    if (this.blendColor && this.blendColor.isColor) data.blendColor = this.blendColor.getHex();
    if (this.blendAlpha !== 0) data.blendAlpha = this.blendAlpha;
    if (this.depthFunc !== LessEqualDepth) data.depthFunc = this.depthFunc;
    if (this.depthTest === false) data.depthTest = this.depthTest;
    if (this.depthWrite === false) data.depthWrite = this.depthWrite;
    if (this.colorWrite === false) data.colorWrite = this.colorWrite;
    if (this.stencilWriteMask !== 255) data.stencilWriteMask = this.stencilWriteMask;
    if (this.stencilFunc !== AlwaysStencilFunc) data.stencilFunc = this.stencilFunc;
    if (this.stencilRef !== 0) data.stencilRef = this.stencilRef;
    if (this.stencilFuncMask !== 255) data.stencilFuncMask = this.stencilFuncMask;
    if (this.stencilFail !== KeepStencilOp) data.stencilFail = this.stencilFail;
    if (this.stencilZFail !== KeepStencilOp) data.stencilZFail = this.stencilZFail;
    if (this.stencilZPass !== KeepStencilOp) data.stencilZPass = this.stencilZPass;
    if (this.stencilWrite === true) data.stencilWrite = this.stencilWrite;
    if (this.rotation !== void 0 && this.rotation !== 0) data.rotation = this.rotation;
    if (this.polygonOffset === true) data.polygonOffset = true;
    if (this.polygonOffsetFactor !== 0) data.polygonOffsetFactor = this.polygonOffsetFactor;
    if (this.polygonOffsetUnits !== 0) data.polygonOffsetUnits = this.polygonOffsetUnits;
    if (this.linewidth !== void 0 && this.linewidth !== 1) data.linewidth = this.linewidth;
    if (this.dashSize !== void 0) data.dashSize = this.dashSize;
    if (this.gapSize !== void 0) data.gapSize = this.gapSize;
    if (this.scale !== void 0) data.scale = this.scale;
    if (this.dithering === true) data.dithering = true;
    if (this.alphaTest > 0) data.alphaTest = this.alphaTest;
    if (this.alphaHash === true) data.alphaHash = true;
    if (this.alphaToCoverage === true) data.alphaToCoverage = true;
    if (this.premultipliedAlpha === true) data.premultipliedAlpha = true;
    if (this.forceSinglePass === true) data.forceSinglePass = true;
    if (this.wireframe === true) data.wireframe = true;
    if (this.wireframeLinewidth > 1) data.wireframeLinewidth = this.wireframeLinewidth;
    if (this.flatShading === true) data.flatShading = true;
    if (this.visible === false) data.visible = false;
    if (this.toneMapped === false) data.toneMapped = false;
    if (this.fog === false) data.fog = false;
    if (Object.keys(this.userData).length > 0) data.userData = this.userData;
    function extractFromCache(cache) {
      const values = [];
      for (const key in cache) {
        const data2 = cache[key];
        delete data2.metadata;
        values.push(data2);
      }
      return values;
    }
    if (isRootObject) {
      const textures = extractFromCache(meta.textures);
      const images = extractFromCache(meta.images);
      if (textures.length > 0) data.textures = textures;
      if (images.length > 0) data.images = images;
    }
    return data;
  }
  /** @returns {this} */
  clone() {
    return new this.constructor().copy(this);
  }
  /**
   * @param {Material} source
   * @returns {this}
   */
  copy(source) {
    this.name = source.name;
    this.blending = source.blending;
    this.side = source.side;
    this.vertexColors = source.vertexColors;
    this.opacity = source.opacity;
    this.transparent = source.transparent;
    this.blendSrc = source.blendSrc;
    this.blendDst = source.blendDst;
    this.blendEquation = source.blendEquation;
    this.blendSrcAlpha = source.blendSrcAlpha;
    this.blendDstAlpha = source.blendDstAlpha;
    this.blendEquationAlpha = source.blendEquationAlpha;
    this.blendColor.copy(source.blendColor);
    this.blendAlpha = source.blendAlpha;
    this.depthFunc = source.depthFunc;
    this.depthTest = source.depthTest;
    this.depthWrite = source.depthWrite;
    this.stencilWriteMask = source.stencilWriteMask;
    this.stencilFunc = source.stencilFunc;
    this.stencilRef = source.stencilRef;
    this.stencilFuncMask = source.stencilFuncMask;
    this.stencilFail = source.stencilFail;
    this.stencilZFail = source.stencilZFail;
    this.stencilZPass = source.stencilZPass;
    this.stencilWrite = source.stencilWrite;
    const srcPlanes = source.clippingPlanes;
    let dstPlanes = null;
    if (srcPlanes !== null) {
      const n = srcPlanes.length;
      dstPlanes = new Array(n);
      for (let i = 0; i !== n; ++i) {
        dstPlanes[i] = srcPlanes[i].clone();
      }
    }
    this.clippingPlanes = dstPlanes;
    this.clipIntersection = source.clipIntersection;
    this.clipShadows = source.clipShadows;
    this.shadowSide = source.shadowSide;
    this.colorWrite = source.colorWrite;
    this.precision = source.precision;
    this.polygonOffset = source.polygonOffset;
    this.polygonOffsetFactor = source.polygonOffsetFactor;
    this.polygonOffsetUnits = source.polygonOffsetUnits;
    this.dithering = source.dithering;
    this.alphaTest = source.alphaTest;
    this.alphaHash = source.alphaHash;
    this.alphaToCoverage = source.alphaToCoverage;
    this.premultipliedAlpha = source.premultipliedAlpha;
    this.forceSinglePass = source.forceSinglePass;
    this.visible = source.visible;
    this.toneMapped = source.toneMapped;
    this.userData = JSON.parse(JSON.stringify(source.userData));
    return this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
let _materialId = 0;

class LineBasicMaterial extends Material {
  type = "LineBasicMaterial";
  color = new Color(16777215);
  map = null;
  linewidth = 1;
  // may be ignored
  fog = true;
  constructor(parameters) {
    super();
    this.setValues(parameters);
  }
  get isLineBasicMaterial() {
    return true;
  }
  /**
   * @param {LineBasicMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);
    this.color.copy(source.color);
    this.map = source.map;
    this.linewidth = source.linewidth;
    this.fog = source.fog;
    return this;
  }
}

class MeshBasicMaterial extends Material {
  type = "MeshBasicMaterial";
  color = new Color(16777215);
  // emissive
  map = null;
  lightMap = null;
  lightMapIntensity = 1;
  aoMap = null;
  aoMapIntensity = 1;
  specularMap = null;
  alphaMap = null;
  envMap = null;
  combine = MultiplyOperation;
  reflectivity = 1;
  refractionRatio = 0.98;
  wireframe = false;
  wireframeLinewidth = 1;
  // will almost always be 1
  fog = true;
  constructor(parameters) {
    super();
    this.setValues(parameters);
  }
  get isMeshBasicMaterial() {
    return true;
  }
  /**
   * @param {MeshBasicMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);
    this.color.copy(source.color);
    this.map = source.map;
    this.lightMap = source.lightMap;
    this.lightMapIntensity = source.lightMapIntensity;
    this.aoMap = source.aoMap;
    this.aoMapIntensity = source.aoMapIntensity;
    this.specularMap = source.specularMap;
    this.alphaMap = source.alphaMap;
    this.envMap = source.envMap;
    this.combine = source.combine;
    this.reflectivity = source.reflectivity;
    this.refractionRatio = source.refractionRatio;
    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;
    this.fog = source.fog;
    return this;
  }
}

class MeshDepthMaterial extends Material {
  type = "MeshDepthMaterial";
  depthPacking = BasicDepthPacking;
  map = null;
  alphaMap = null;
  displacementMap = null;
  displacementScale = 1;
  displacementBias = 0;
  wireframe = false;
  wireframeLinewidth = 1;
  // will almost always be 1
  constructor(parameters) {
    super();
    this.setValues(parameters);
  }
  get isMeshDepthMaterial() {
    return true;
  }
  /**
   * @param {MeshDepthMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);
    this.depthPacking = source.depthPacking;
    this.map = source.map;
    this.alphaMap = source.alphaMap;
    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;
    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;
    return this;
  }
}

class MeshDistanceMaterial extends Material {
  type = "MeshDistanceMaterial";
  map = null;
  alphaMap = null;
  displacementMap = null;
  displacementScale = 1;
  displacementBias = 0;
  constructor(parameters) {
    super();
    this.setValues(parameters);
  }
  get isMeshDistanceMaterial() {
    return true;
  }
  /**
   * @param {MeshDistanceMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);
    this.map = source.map;
    this.alphaMap = source.alphaMap;
    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;
    return this;
  }
}

class MeshNormalMaterial extends Material {
  type = "MeshNormalMaterial";
  bumpMap = null;
  bumpScale = 1;
  normalMap = null;
  normalMapType = TangentSpaceNormalMap;
  normalScale = new Vector2(1, 1);
  displacementMap = null;
  displacementScale = 1;
  displacementBias = 0;
  wireframe = false;
  wireframeLinewidth = 1;
  flatShading = false;
  constructor(parameters) {
    super();
    this.setValues(parameters);
  }
  get isMeshNormalMaterial() {
    return true;
  }
  /**
   * @param {MeshNormalMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);
    this.bumpMap = source.bumpMap;
    this.bumpScale = source.bumpScale;
    this.normalMap = source.normalMap;
    this.normalMapType = source.normalMapType;
    this.normalScale.copy(source.normalScale);
    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;
    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;
    this.flatShading = source.flatShading;
    return this;
  }
}

class MeshStandardMaterial extends Material {
  type = "MeshStandardMaterial";
  defines = { STANDARD: "" };
  color = new Color(16777215);
  // diffuse
  roughness = 1;
  metalness = 0;
  map = null;
  lightMap = null;
  lightMapIntensity = 1;
  aoMap = null;
  aoMapIntensity = 1;
  emissive = new Color(0);
  emissiveIntensity = 1;
  emissiveMap = null;
  bumpMap = null;
  bumpScale = 1;
  normalMap = null;
  normalMapType = TangentSpaceNormalMap;
  normalScale = new Vector2(1, 1);
  displacementMap = null;
  displacementScale = 1;
  displacementBias = 0;
  roughnessMap = null;
  metalnessMap = null;
  alphaMap = null;
  envMap = null;
  envMapIntensity = 1;
  wireframe = false;
  wireframeLinewidth = 1;
  // will almost always be 1
  flatShading = false;
  fog = true;
  constructor(parameters) {
    super();
    this.setValues(parameters);
  }
  get isMeshStandardMaterial() {
    return true;
  }
  /**
   * @param {MeshStandardMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);
    this.defines = { STANDARD: "" };
    this.color.copy(source.color);
    this.roughness = source.roughness;
    this.metalness = source.metalness;
    this.map = source.map;
    this.lightMap = source.lightMap;
    this.lightMapIntensity = source.lightMapIntensity;
    this.aoMap = source.aoMap;
    this.aoMapIntensity = source.aoMapIntensity;
    this.emissive.copy(source.emissive);
    this.emissiveMap = source.emissiveMap;
    this.emissiveIntensity = source.emissiveIntensity;
    this.bumpMap = source.bumpMap;
    this.bumpScale = source.bumpScale;
    this.normalMap = source.normalMap;
    this.normalMapType = source.normalMapType;
    this.normalScale.copy(source.normalScale);
    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;
    this.roughnessMap = source.roughnessMap;
    this.metalnessMap = source.metalnessMap;
    this.alphaMap = source.alphaMap;
    this.envMap = source.envMap;
    this.envMapIntensity = source.envMapIntensity;
    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;
    this.flatShading = source.flatShading;
    this.fog = source.fog;
    return this;
  }
}

class MeshPhysicalMaterial extends MeshStandardMaterial {
  type = "MeshPhysicalMaterial";
  defines = {
    STANDARD: "",
    PHYSICAL: ""
  };
  anisotropyRotation = 0;
  anisotropyMap = null;
  clearcoatMap = null;
  clearcoatRoughness = 0;
  clearcoatRoughnessMap = null;
  clearcoatNormalScale = new Vector2(1, 1);
  clearcoatNormalMap = null;
  ior = 1.5;
  iridescenceMap = null;
  iridescenceIOR = 1.3;
  iridescenceThicknessRange = [100, 400];
  iridescenceThicknessMap = null;
  sheenColor = new Color(0);
  sheenColorMap = null;
  sheenRoughness = 1;
  sheenRoughnessMap = null;
  transmissionMap = null;
  thickness = 0;
  thicknessMap = null;
  attenuationDistance = Infinity;
  attenuationColor = new Color(1, 1, 1);
  specularIntensity = 1;
  specularIntensityMap = null;
  specularColor = new Color(1, 1, 1);
  specularColorMap = null;
  #anisotropy = 0;
  #clearcoat = 0;
  #iridescence = 0;
  #sheen = 0;
  #transmission = 0;
  constructor(parameters) {
    super();
    this.setValues(parameters);
  }
  get isMeshPhysicalMaterial() {
    return true;
  }
  get anisotropy() {
    return this.#anisotropy;
  }
  set anisotropy(value) {
    if (this.#anisotropy > 0 !== value > 0) {
      this.version++;
    }
    this.#anisotropy = value;
  }
  get clearcoat() {
    return this.#clearcoat;
  }
  set clearcoat(value) {
    if (this.#clearcoat > 0 !== value > 0) {
      this.version++;
    }
    this.#clearcoat = value;
  }
  get iridescence() {
    return this.#iridescence;
  }
  set iridescence(value) {
    if (this.#iridescence > 0 !== value > 0) {
      this.version++;
    }
    this.#iridescence = value;
  }
  get reflectivity() {
    return clamp(2.5 * (this.ior - 1) / (this.ior + 1), 0, 1);
  }
  set reflectivity(reflectivity) {
    this.ior = (1 + 0.4 * reflectivity) / (1 - 0.4 * reflectivity);
  }
  get sheen() {
    return this.#sheen;
  }
  set sheen(value) {
    if (this.#sheen > 0 !== value > 0) {
      this.version++;
    }
    this.#sheen = value;
  }
  get transmission() {
    return this.#transmission;
  }
  set transmission(value) {
    if (this.#transmission > 0 !== value > 0) {
      this.version++;
    }
    this.#transmission = value;
  }
  /**
   * @param {MeshPhysicalMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);
    this.defines = {
      STANDARD: "",
      PHYSICAL: ""
    };
    this.anisotropy = source.anisotropy;
    this.anisotropyRotation = source.anisotropyRotation;
    this.anisotropyMap = source.anisotropyMap;
    this.clearcoat = source.clearcoat;
    this.clearcoatMap = source.clearcoatMap;
    this.clearcoatRoughness = source.clearcoatRoughness;
    this.clearcoatRoughnessMap = source.clearcoatRoughnessMap;
    this.clearcoatNormalMap = source.clearcoatNormalMap;
    this.clearcoatNormalScale.copy(source.clearcoatNormalScale);
    this.ior = source.ior;
    this.iridescence = source.iridescence;
    this.iridescenceMap = source.iridescenceMap;
    this.iridescenceIOR = source.iridescenceIOR;
    this.iridescenceThicknessRange = [...source.iridescenceThicknessRange];
    this.iridescenceThicknessMap = source.iridescenceThicknessMap;
    this.sheen = source.sheen;
    this.sheenColor.copy(source.sheenColor);
    this.sheenColorMap = source.sheenColorMap;
    this.sheenRoughness = source.sheenRoughness;
    this.sheenRoughnessMap = source.sheenRoughnessMap;
    this.transmission = source.transmission;
    this.transmissionMap = source.transmissionMap;
    this.thickness = source.thickness;
    this.thicknessMap = source.thicknessMap;
    this.attenuationDistance = source.attenuationDistance;
    this.attenuationColor.copy(source.attenuationColor);
    this.specularIntensity = source.specularIntensity;
    this.specularIntensityMap = source.specularIntensityMap;
    this.specularColor.copy(source.specularColor);
    this.specularColorMap = source.specularColorMap;
    return this;
  }
}

class PointsMaterial extends Material {
  type = "PointsMaterial";
  color = new Color(16777215);
  map = null;
  alphaMap = null;
  size = 1;
  sizeAttenuation = true;
  fog = true;
  constructor(parameters) {
    super();
    this.setValues(parameters);
  }
  get isPointsMaterial() {
    return true;
  }
  /**
   * @param {PointsMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);
    this.color.copy(source.color);
    this.map = source.map;
    this.alphaMap = source.alphaMap;
    this.size = source.size;
    this.sizeAttenuation = source.sizeAttenuation;
    this.fog = source.fog;
    return this;
  }
}

var default_vertex = `
void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

var default_fragment = `
void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}
`;

class ShaderMaterial extends Material {
  type = "ShaderMaterial";
  defines = {};
  uniforms = {};
  uniformsGroups = [];
  vertexShader = default_vertex;
  fragmentShader = default_fragment;
  linewidth = 1;
  wireframe = false;
  wireframeLinewidth = 1;
  fog = false;
  // set to use scene fog
  lights = false;
  // set to use scene lights
  clipping = false;
  // set to use user-defined clipping planes
  forceSinglePass = true;
  extensions = {
    derivatives: false,
    // set to use derivatives
    fragDepth: false,
    // set to use fragment depth values
    drawBuffers: false,
    // set to use draw buffers
    shaderTextureLOD: false
    // set to use shader texture LOD
  };
  // When rendered geometry doesn't include these attributes but the material does,
  // use these default values in WebGL. This avoids errors when buffer data is missing.
  defaultAttributeValues = {
    color: [1, 1, 1],
    uv: [0, 0],
    uv1: [0, 0]
  };
  index0AttributeName = void 0;
  uniformsNeedUpdate = false;
  glslVersion = null;
  constructor(parameters) {
    super();
    if (parameters !== void 0) {
      this.setValues(parameters);
    }
  }
  get isShaderMaterial() {
    return true;
  }
  /**
   * @param {ShaderMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);
    this.fragmentShader = source.fragmentShader;
    this.vertexShader = source.vertexShader;
    this.uniforms = cloneUniforms(source.uniforms);
    this.uniformsGroups = cloneUniformsGroups(source.uniformsGroups);
    this.defines = Object.assign({}, source.defines);
    this.linewidth = source.linewidth;
    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;
    this.fog = source.fog;
    this.lights = source.lights;
    this.clipping = source.clipping;
    this.extensions = Object.assign({}, source.extensions);
    this.glslVersion = source.glslVersion;
    return this;
  }
  toJSON(meta) {
    const data = super.toJSON(meta);
    data.glslVersion = this.glslVersion;
    data.uniforms = {};
    for (const name in this.uniforms) {
      const uniform = this.uniforms[name];
      const value = uniform.value;
      if (value && value.isTexture) {
        data.uniforms[name] = {
          type: "t",
          value: value.toJSON(meta).uuid
        };
      } else if (value && value.isColor) {
        data.uniforms[name] = {
          type: "c",
          value: value.getHex()
        };
      } else if (value && value.isVector2) {
        data.uniforms[name] = {
          type: "v2",
          value: value.toArray()
        };
      } else if (value && value.isVector3) {
        data.uniforms[name] = {
          type: "v3",
          value: value.toArray()
        };
      } else if (value && value.isVector4) {
        data.uniforms[name] = {
          type: "v4",
          value: value.toArray()
        };
      } else if (value && value.isMatrix3) {
        data.uniforms[name] = {
          type: "m3",
          value: value.toArray()
        };
      } else if (value && value.isMatrix4) {
        data.uniforms[name] = {
          type: "m4",
          value: value.toArray()
        };
      } else {
        data.uniforms[name] = {
          value
        };
      }
    }
    if (Object.keys(this.defines).length > 0) data.defines = this.defines;
    data.vertexShader = this.vertexShader;
    data.fragmentShader = this.fragmentShader;
    data.lights = this.lights;
    data.clipping = this.clipping;
    const extensions = {};
    for (const key in this.extensions) {
      if (this.extensions[key] === true) extensions[key] = true;
    }
    if (Object.keys(extensions).length > 0) data.extensions = extensions;
    return data;
  }
}

class RawShaderMaterial extends ShaderMaterial {
  type = "RawShaderMaterial";
  constructor(parameters) {
    super(parameters);
  }
  get isRawShaderMaterial() {
    return true;
  }
}

class ShadowMaterial extends Material {
  type = "ShadowMaterial";
  color = new Color(0);
  transparent = true;
  fog = true;
  constructor(parameters) {
    super();
    this.setValues(parameters);
  }
  get isShadowMaterial() {
    return true;
  }
  /**
   * @param {ShadowMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);
    this.color.copy(source.color);
    this.fog = source.fog;
    return this;
  }
}

class SpriteMaterial extends Material {
  type = "SpriteMaterial";
  transparent = true;
  color = new Color(16777215);
  map = null;
  alphaMap = null;
  rotation = 0;
  sizeAttenuation = true;
  fog = true;
  constructor(parameters) {
    super();
    this.setValues(parameters);
  }
  get isSpriteMaterial() {
    return true;
  }
  /**
   * @param {SpriteMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);
    this.color.copy(source.color);
    this.map = source.map;
    this.alphaMap = source.alphaMap;
    this.rotation = source.rotation;
    this.sizeAttenuation = source.sizeAttenuation;
    this.fog = source.fog;
    return this;
  }
}

export { LineBasicMaterial, Material, MeshBasicMaterial, MeshDepthMaterial, MeshDistanceMaterial, MeshNormalMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PointsMaterial, RawShaderMaterial, ShaderMaterial, ShadowMaterial, SpriteMaterial };
