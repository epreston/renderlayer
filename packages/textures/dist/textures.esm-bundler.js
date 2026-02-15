import { ImageUtils, UVMapping, ClampToEdgeWrapping, LinearFilter, LinearMipmapLinearFilter, RGBAFormat, UnsignedByteType, NoColorSpace, MirroredRepeatWrapping, RepeatWrapping, CubeReflectionMapping, UnsignedIntType, NearestFilter, DepthFormat, DepthStencilFormat, SIGNED_RED_GREEN_RGTC2_Format, RED_GREEN_RGTC2_Format, SIGNED_RED_RGTC1_Format, RED_RGTC1_Format, RGB_BPTC_UNSIGNED_Format, RGB_BPTC_SIGNED_Format, RGBA_BPTC_Format, RGBA_ASTC_12x12_Format, RGBA_ASTC_12x10_Format, RGBA_ASTC_10x10_Format, RGBA_ASTC_10x8_Format, RGBA_ASTC_10x6_Format, RGBA_ASTC_10x5_Format, RGBA_ASTC_8x8_Format, RGBA_ASTC_8x6_Format, RGBA_ASTC_8x5_Format, RGBA_ASTC_6x6_Format, RGBA_ASTC_6x5_Format, RGBA_ASTC_5x5_Format, RGBA_ASTC_5x4_Format, RGBA_ASTC_4x4_Format, SIGNED_RG11_EAC_Format, RG11_EAC_Format, RGBA_ETC2_EAC_Format, SIGNED_R11_EAC_Format, R11_EAC_Format, RGB_ETC2_Format, RGB_ETC1_Format, RGBA_PVRTC_4BPPV1_Format, RGB_PVRTC_4BPPV1_Format, RGBA_PVRTC_2BPPV1_Format, RGB_PVRTC_2BPPV1_Format, RGBA_S3TC_DXT5_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT1_Format, RGB_S3TC_DXT1_Format, RGBAIntegerFormat, RGBFormat, RGIntegerFormat, RGFormat, RedIntegerFormat, RedFormat, AlphaFormat, UnsignedInt101111Type, UnsignedInt5999Type, FloatType, IntType, UnsignedShort5551Type, UnsignedShort4444Type, HalfFloatType, ShortType, UnsignedShortType, ByteType } from '@renderlayer/shared';
import { EventDispatcher } from '@renderlayer/core';
import { generateUUID, Vector2, Matrix3, Vector3 } from '@renderlayer/math';

class Source {
  #id = _sourceId++;
  uuid = generateUUID();
  data = null;
  // obj or array
  dataReady = true;
  version = 0;
  constructor(data = null) {
    this.data = data;
  }
  get isSource() {
    return true;
  }
  get id() {
    return this.#id;
  }
  /**
   * Returns the dimensions of the source into the given target vector.
   *
   * @param {(Vector2 | Vector3)} target - The target object the result is written into.
   * @return {(Vector2 | Vector3)} The dimensions of the source.
   */
  getSize(target) {
    const data = this.data;
    if (typeof HTMLVideoElement !== "undefined" && data instanceof HTMLVideoElement) {
      target.set(data.videoWidth, data.videoHeight, 0);
    } else if (typeof VideoFrame !== "undefined" && data instanceof VideoFrame) {
      target.set(data.displayHeight, data.displayWidth, 0);
    } else if (data !== null) {
      target.set(data.width, data.height, data.depth || 0);
    } else {
      target.set(0, 0, 0);
    }
    return target;
  }
  set needsUpdate(value) {
    if (value === true) this.version++;
  }
  toJSON(meta) {
    const isRootObject = meta === void 0 || typeof meta === "string";
    if (!isRootObject && meta.images[this.uuid] !== void 0) {
      return meta.images[this.uuid];
    }
    const output = { uuid: this.uuid, url: "" };
    const data = this.data;
    if (data !== null) {
      let url;
      if (Array.isArray(data)) {
        url = [];
        for (let i = 0, l = data.length; i < l; i++) {
          if (data[i].isDataTexture) {
            url.push(_serializeImage(data[i].image));
          } else {
            url.push(_serializeImage(data[i]));
          }
        }
      } else {
        url = _serializeImage(data);
      }
      output.url = url;
    }
    if (!isRootObject) {
      meta.images[this.uuid] = output;
    }
    return output;
  }
}
let _sourceId = 0;
function _serializeImage(image) {
  if (typeof HTMLImageElement !== "undefined" && image instanceof HTMLImageElement || typeof HTMLCanvasElement !== "undefined" && image instanceof HTMLCanvasElement || typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
    return ImageUtils.getDataURL(image);
  } else {
    if (image.data) {
      return {
        data: Array.from(image.data),
        width: image.width,
        height: image.height,
        type: image.data.constructor.name
      };
    } else {
      console.warn("Texture: Unable to serialize Texture.");
      return {};
    }
  }
}

class Texture extends EventDispatcher {
  static DEFAULT_IMAGE = null;
  static DEFAULT_MAPPING = UVMapping;
  static DEFAULT_ANISOTROPY = 1;
  #id = _textureId++;
  uuid = generateUUID();
  name = "";
  source;
  mipmaps = [];
  mapping = Texture.DEFAULT_MAPPING;
  channel = 0;
  wrapS = ClampToEdgeWrapping;
  wrapT = ClampToEdgeWrapping;
  magFilter = LinearFilter;
  minFilter = LinearMipmapLinearFilter;
  anisotropy = Texture.DEFAULT_ANISOTROPY;
  format = RGBAFormat;
  internalFormat = null;
  type = UnsignedByteType;
  offset = new Vector2(0, 0);
  repeat = new Vector2(1, 1);
  center = new Vector2(0, 0);
  rotation = 0;
  matrixAutoUpdate = true;
  matrix = new Matrix3();
  generateMipmaps = true;
  premultiplyAlpha = false;
  flipY = true;
  // valid values: 1, 2, 4, 8
  // see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml
  unpackAlignment = 4;
  colorSpace = NoColorSpace;
  userData = {};
  updateRanges = [];
  version = 0;
  onUpdate = null;
  /** @type {?(RenderTarget | WebGLRenderTarget)} */
  renderTarget = null;
  isRenderTargetTexture = false;
  isArrayTexture = false;
  // indicates whether this texture should be processed by
  // PMREMGenerator or not (only relevant for render target textures)
  #needsPMREMUpdate = false;
  pmremVersion = 0;
  constructor(image = Texture.DEFAULT_IMAGE, mapping = Texture.DEFAULT_MAPPING, wrapS = ClampToEdgeWrapping, wrapT = ClampToEdgeWrapping, magFilter = LinearFilter, minFilter = LinearMipmapLinearFilter, format = RGBAFormat, type = UnsignedByteType, anisotropy = Texture.DEFAULT_ANISOTROPY, colorSpace = NoColorSpace) {
    super();
    this.source = new Source(image);
    this.mapping = mapping;
    this.wrapS = wrapS;
    this.wrapT = wrapT;
    this.magFilter = magFilter;
    this.minFilter = minFilter;
    this.anisotropy = anisotropy;
    this.format = format;
    this.type = type;
    this.colorSpace = colorSpace;
  }
  get isTexture() {
    return true;
  }
  get id() {
    return this.#id;
  }
  /**
   * The width of the texture in pixels.
   */
  get width() {
    return this.source.getSize(_tempVec3).x;
  }
  /**
   * The height of the texture in pixels.
   */
  get height() {
    return this.source.getSize(_tempVec3).y;
  }
  /**
   * The depth of the texture in pixels.
   */
  get depth() {
    return this.source.getSize(_tempVec3).z;
  }
  get image() {
    return this.source.data;
  }
  set image(value) {
    this.source.data = value ? value : null;
  }
  set needsUpdate(value) {
    if (value === true) {
      this.version++;
      this.source.needsUpdate = true;
    }
  }
  /** @type {boolean} */
  get needsPMREMUpdate() {
    return this.#needsPMREMUpdate;
  }
  /** @type {boolean} */
  set needsPMREMUpdate(value) {
    this.#needsPMREMUpdate = value;
    if (value === true) {
      this.pmremVersion++;
    }
  }
  updateMatrix() {
    this.matrix.setUvTransform(
      this.offset.x,
      this.offset.y,
      this.repeat.x,
      this.repeat.y,
      this.rotation,
      this.center.x,
      this.center.y
    );
  }
  /**
   * Adds a range of data in the data texture to be updated on the GPU.
   *
   * @param {number} start - Position at which to start update.
   * @param {number} count - The number of components to update.
   */
  addUpdateRange(start, count) {
    this.updateRanges.push({ start, count });
  }
  /**
   * Clears the update ranges.
   */
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  /** @returns {this} */
  clone() {
    return new this.constructor().copy(this);
  }
  /** @param {Texture} source */
  copy(source) {
    this.name = source.name;
    this.source = source.source;
    this.mipmaps = source.mipmaps.slice(0);
    this.mapping = source.mapping;
    this.channel = source.channel;
    this.wrapS = source.wrapS;
    this.wrapT = source.wrapT;
    this.magFilter = source.magFilter;
    this.minFilter = source.minFilter;
    this.anisotropy = source.anisotropy;
    this.format = source.format;
    this.internalFormat = source.internalFormat;
    this.type = source.type;
    this.offset.copy(source.offset);
    this.repeat.copy(source.repeat);
    this.center.copy(source.center);
    this.rotation = source.rotation;
    this.matrixAutoUpdate = source.matrixAutoUpdate;
    this.matrix.copy(source.matrix);
    this.generateMipmaps = source.generateMipmaps;
    this.premultiplyAlpha = source.premultiplyAlpha;
    this.flipY = source.flipY;
    this.unpackAlignment = source.unpackAlignment;
    this.colorSpace = source.colorSpace;
    this.renderTarget = source.renderTarget;
    this.isRenderTargetTexture = source.isRenderTargetTexture;
    this.isArrayTexture = source.isArrayTexture;
    this.userData = JSON.parse(JSON.stringify(source.userData));
    this.needsUpdate = true;
    return this;
  }
  /**
   * Sets this texture's properties based on `values`.
   * @param {Object} values - A container with texture parameters.
   */
  setValues(values) {
    for (const key in values) {
      const newValue = values[key];
      if (newValue === void 0) {
        console.warn(`Texture.setValues(): parameter '${key}' has value of undefined.`);
        continue;
      }
      const currentValue = this[key];
      if (currentValue === void 0) {
        console.warn(`Texture.setValues(): property '${key}' does not exist.`);
        continue;
      }
      if (currentValue && newValue && currentValue.isVector2 && newValue.isVector2) {
        currentValue.copy(newValue);
      } else if (currentValue && newValue && currentValue.isVector3 && newValue.isVector3) {
        currentValue.copy(newValue);
      } else if (currentValue && newValue && currentValue.isMatrix3 && newValue.isMatrix3) {
        currentValue.copy(newValue);
      } else {
        this[key] = newValue;
      }
    }
  }
  toJSON(meta) {
    const isRootObject = meta === void 0 || typeof meta === "string";
    if (!isRootObject && meta.textures[this.uuid] !== void 0) {
      return meta.textures[this.uuid];
    }
    const output = {
      metadata: {
        version: 4.5,
        type: "Texture",
        generator: "Texture.toJSON"
      },
      uuid: this.uuid,
      name: this.name,
      image: this.source.toJSON(meta).uuid,
      mapping: this.mapping,
      channel: this.channel,
      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,
      wrap: [this.wrapS, this.wrapT],
      format: this.format,
      internalFormat: this.internalFormat,
      type: this.type,
      colorSpace: this.colorSpace,
      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,
      flipY: this.flipY,
      generateMipmaps: this.generateMipmaps,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment
    };
    if (Object.keys(this.userData).length > 0) output.userData = this.userData;
    if (!isRootObject) {
      meta.textures[this.uuid] = output;
    }
    return output;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  /** @param {Vector2} uv */
  transformUv(uv) {
    if (this.mapping !== UVMapping) return uv;
    uv.applyMatrix3(this.matrix);
    if (uv.x < 0 || uv.x > 1) {
      switch (this.wrapS) {
        case RepeatWrapping:
          uv.x = uv.x - Math.floor(uv.x);
          break;
        case ClampToEdgeWrapping:
          uv.x = uv.x < 0 ? 0 : 1;
          break;
        case MirroredRepeatWrapping:
          if (Math.abs(Math.floor(uv.x) % 2) === 1) {
            uv.x = Math.ceil(uv.x) - uv.x;
          } else {
            uv.x = uv.x - Math.floor(uv.x);
          }
          break;
      }
    }
    if (uv.y < 0 || uv.y > 1) {
      switch (this.wrapT) {
        case RepeatWrapping:
          uv.y = uv.y - Math.floor(uv.y);
          break;
        case ClampToEdgeWrapping:
          uv.y = uv.y < 0 ? 0 : 1;
          break;
        case MirroredRepeatWrapping:
          if (Math.abs(Math.floor(uv.y) % 2) === 1) {
            uv.y = Math.ceil(uv.y) - uv.y;
          } else {
            uv.y = uv.y - Math.floor(uv.y);
          }
          break;
      }
    }
    if (this.flipY) {
      uv.y = 1 - uv.y;
    }
    return uv;
  }
}
let _textureId = 0;
const _tempVec3 = /* @__PURE__ */ new Vector3();

class CompressedTexture extends Texture {
  constructor(mipmaps, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, colorSpace) {
    super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace);
    this.image = { width, height };
    this.mipmaps = mipmaps;
    this.flipY = false;
    this.generateMipmaps = false;
  }
  get isCompressedTexture() {
    return true;
  }
}

class CompressedArrayTexture extends CompressedTexture {
  wrapR = ClampToEdgeWrapping;
  constructor(mipmaps, width, height, depth, format, type) {
    super(mipmaps, width, height, format, type);
    this.image.depth = depth;
  }
  get isCompressedArrayTexture() {
    return true;
  }
}

class CompressedCubeTexture extends CompressedTexture {
  constructor(images, format, type) {
    super(void 0, images[0].width, images[0].height, format, type, CubeReflectionMapping);
    this.image = images;
  }
  get isCompressedCubeTexture() {
    return true;
  }
  get isCubeTexture() {
    return true;
  }
}

class DepthTexture extends Texture {
  /**
   * Code corresponding to the depth compare function.
   *
   * @type {?(NeverCompare|LessCompare|EqualCompare|
   *          LessEqualCompare|GreaterCompare|NotEqualCompare|
   *          GreaterEqualCompare|AlwaysCompare)}
   */
  compareFunction = null;
  constructor(width, height, type = UnsignedIntType, mapping, wrapS, wrapT, magFilter = NearestFilter, minFilter = NearestFilter, anisotropy, format = DepthFormat, depth = 1) {
    if (format !== DepthFormat && format !== DepthStencilFormat) {
      throw new Error("DepthTexture format must be either DepthFormat or DepthStencilFormat");
    }
    const image = { width, height, depth };
    super(image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);
    this.flipY = false;
    this.generateMipmaps = false;
  }
  get isDepthTexture() {
    return true;
  }
  copy(source) {
    super.copy(source);
    this.source = new Source(Object.assign({}, source.image));
    this.compareFunction = source.compareFunction;
    return this;
  }
  toJSON(meta) {
    const data = super.toJSON(meta);
    if (this.compareFunction !== null) data.compareFunction = this.compareFunction;
    return data;
  }
}

class CubeDepthTexture extends DepthTexture {
  constructor(size, type = UnsignedIntType, mapping = CubeReflectionMapping, wrapS, wrapT, magFilter = NearestFilter, minFilter = NearestFilter, anisotropy, format = DepthFormat) {
    const image = { width: size, height: size, depth: 1 };
    const images = [image, image, image, image, image, image];
    super(size, size, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, format);
    this.image = images;
  }
  get isCubeDepthTexture() {
    return true;
  }
  get isCubeTexture() {
    return true;
  }
  get images() {
    return this.image;
  }
  set images(value) {
    this.image = value;
  }
}

class CubeTexture extends Texture {
  constructor(images = [], mapping = CubeReflectionMapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace) {
    super(
      images,
      mapping,
      wrapS,
      wrapT,
      magFilter,
      minFilter,
      format,
      type,
      anisotropy,
      colorSpace
    );
    this.flipY = false;
  }
  get isCubeTexture() {
    return true;
  }
  get images() {
    return this.image;
  }
  set images(value) {
    this.image = value;
  }
}

class Data3DTexture extends Texture {
  wrapR = ClampToEdgeWrapping;
  constructor(data = null, width = 1, height = 1, depth = 1) {
    super(null);
    this.image = { data, width, height, depth };
    this.magFilter = NearestFilter;
    this.minFilter = NearestFilter;
    this.generateMipmaps = false;
    this.flipY = false;
    this.unpackAlignment = 1;
  }
  get isData3DTexture() {
    return true;
  }
}

class DataArrayTexture extends Texture {
  wrapR = ClampToEdgeWrapping;
  constructor(data = null, width = 1, height = 1, depth = 1) {
    super(null);
    this.image = { data, width, height, depth };
    this.magFilter = NearestFilter;
    this.minFilter = NearestFilter;
    this.generateMipmaps = false;
    this.flipY = false;
    this.unpackAlignment = 1;
  }
  get isDataArrayTexture() {
    return true;
  }
}

class DataTexture extends Texture {
  constructor(data = null, width = 1, height = 1, format, type, mapping, wrapS, wrapT, magFilter = NearestFilter, minFilter = NearestFilter, anisotropy, colorSpace) {
    super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace);
    this.image = { data, width, height };
    this.generateMipmaps = false;
    this.flipY = false;
    this.unpackAlignment = 1;
  }
  get isDataTexture() {
    return true;
  }
}

class ExternalTexture extends Texture {
  sourceTexture = null;
  constructor(sourceTexture = null) {
    super();
    this.sourceTexture = sourceTexture;
  }
  get isExternalTexture() {
    return true;
  }
  copy(source) {
    super.copy(source);
    this.sourceTexture = source.sourceTexture;
    return this;
  }
}

class FramebufferTexture extends Texture {
  constructor(width, height) {
    super({ width, height });
    this.magFilter = NearestFilter;
    this.minFilter = NearestFilter;
    this.generateMipmaps = false;
    this.needsUpdate = true;
  }
  get isFramebufferTexture() {
    return true;
  }
}

function contain(texture, aspect) {
  const imageAspect = texture.image && texture.image.width ? texture.image.width / texture.image.height : 1;
  if (imageAspect > aspect) {
    texture.repeat.x = 1;
    texture.repeat.y = imageAspect / aspect;
    texture.offset.x = 0;
    texture.offset.y = (1 - texture.repeat.y) / 2;
  } else {
    texture.repeat.x = aspect / imageAspect;
    texture.repeat.y = 1;
    texture.offset.x = (1 - texture.repeat.x) / 2;
    texture.offset.y = 0;
  }
  return texture;
}
function cover(texture, aspect) {
  const imageAspect = texture.image && texture.image.width ? texture.image.width / texture.image.height : 1;
  if (imageAspect > aspect) {
    texture.repeat.x = aspect / imageAspect;
    texture.repeat.y = 1;
    texture.offset.x = (1 - texture.repeat.x) / 2;
    texture.offset.y = 0;
  } else {
    texture.repeat.x = 1;
    texture.repeat.y = imageAspect / aspect;
    texture.offset.x = 0;
    texture.offset.y = (1 - texture.repeat.y) / 2;
  }
  return texture;
}
function fill(texture) {
  texture.repeat.x = 1;
  texture.repeat.y = 1;
  texture.offset.x = 0;
  texture.offset.y = 0;
  return texture;
}
function getByteLength(width, height, format, type) {
  const typeByteLength = getTextureTypeByteLength(type);
  switch (format) {
    // https://registry.khronos.org/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
    case AlphaFormat:
      return width * height;
    case RedFormat:
      return width * height / typeByteLength.components * typeByteLength.byteLength;
    case RedIntegerFormat:
      return width * height / typeByteLength.components * typeByteLength.byteLength;
    case RGFormat:
      return width * height * 2 / typeByteLength.components * typeByteLength.byteLength;
    case RGIntegerFormat:
      return width * height * 2 / typeByteLength.components * typeByteLength.byteLength;
    case RGBFormat:
      return width * height * 3 / typeByteLength.components * typeByteLength.byteLength;
    case RGBAFormat:
      return width * height * 4 / typeByteLength.components * typeByteLength.byteLength;
    case RGBAIntegerFormat:
      return width * height * 4 / typeByteLength.components * typeByteLength.byteLength;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_s3tc_srgb/
    case RGB_S3TC_DXT1_Format:
    case RGBA_S3TC_DXT1_Format:
      return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 8;
    case RGBA_S3TC_DXT3_Format:
    case RGBA_S3TC_DXT5_Format:
      return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_pvrtc/
    case RGB_PVRTC_2BPPV1_Format:
    case RGBA_PVRTC_2BPPV1_Format:
      return Math.max(width, 16) * Math.max(height, 8) / 4;
    case RGB_PVRTC_4BPPV1_Format:
    case RGBA_PVRTC_4BPPV1_Format:
      return Math.max(width, 8) * Math.max(height, 8) / 2;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_etc/
    case RGB_ETC1_Format:
    case RGB_ETC2_Format:
    case R11_EAC_Format:
    case SIGNED_R11_EAC_Format:
      return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 8;
    case RGBA_ETC2_EAC_Format:
    case RG11_EAC_Format:
    case SIGNED_RG11_EAC_Format:
      return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_astc/
    case RGBA_ASTC_4x4_Format:
      return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;
    case RGBA_ASTC_5x4_Format:
      return Math.floor((width + 4) / 5) * Math.floor((height + 3) / 4) * 16;
    case RGBA_ASTC_5x5_Format:
      return Math.floor((width + 4) / 5) * Math.floor((height + 4) / 5) * 16;
    case RGBA_ASTC_6x5_Format:
      return Math.floor((width + 5) / 6) * Math.floor((height + 4) / 5) * 16;
    case RGBA_ASTC_6x6_Format:
      return Math.floor((width + 5) / 6) * Math.floor((height + 5) / 6) * 16;
    case RGBA_ASTC_8x5_Format:
      return Math.floor((width + 7) / 8) * Math.floor((height + 4) / 5) * 16;
    case RGBA_ASTC_8x6_Format:
      return Math.floor((width + 7) / 8) * Math.floor((height + 5) / 6) * 16;
    case RGBA_ASTC_8x8_Format:
      return Math.floor((width + 7) / 8) * Math.floor((height + 7) / 8) * 16;
    case RGBA_ASTC_10x5_Format:
      return Math.floor((width + 9) / 10) * Math.floor((height + 4) / 5) * 16;
    case RGBA_ASTC_10x6_Format:
      return Math.floor((width + 9) / 10) * Math.floor((height + 5) / 6) * 16;
    case RGBA_ASTC_10x8_Format:
      return Math.floor((width + 9) / 10) * Math.floor((height + 7) / 8) * 16;
    case RGBA_ASTC_10x10_Format:
      return Math.floor((width + 9) / 10) * Math.floor((height + 9) / 10) * 16;
    case RGBA_ASTC_12x10_Format:
      return Math.floor((width + 11) / 12) * Math.floor((height + 9) / 10) * 16;
    case RGBA_ASTC_12x12_Format:
      return Math.floor((width + 11) / 12) * Math.floor((height + 11) / 12) * 16;
    // https://registry.khronos.org/webgl/extensions/EXT_texture_compression_bptc/
    case RGBA_BPTC_Format:
    case RGB_BPTC_SIGNED_Format:
    case RGB_BPTC_UNSIGNED_Format:
      return Math.ceil(width / 4) * Math.ceil(height / 4) * 16;
    // https://registry.khronos.org/webgl/extensions/EXT_texture_compression_rgtc/
    case RED_RGTC1_Format:
    case SIGNED_RED_RGTC1_Format:
      return Math.ceil(width / 4) * Math.ceil(height / 4) * 8;
    case RED_GREEN_RGTC2_Format:
    case SIGNED_RED_GREEN_RGTC2_Format:
      return Math.ceil(width / 4) * Math.ceil(height / 4) * 16;
  }
  throw new Error(`Unable to determine texture byte length for ${format} format.`);
}
function getTextureTypeByteLength(type) {
  switch (type) {
    case UnsignedByteType:
    case ByteType:
      return { byteLength: 1, components: 1 };
    case UnsignedShortType:
    case ShortType:
    case HalfFloatType:
      return { byteLength: 2, components: 1 };
    case UnsignedShort4444Type:
    case UnsignedShort5551Type:
      return { byteLength: 2, components: 4 };
    case UnsignedIntType:
    case IntType:
    case FloatType:
      return { byteLength: 4, components: 1 };
    case UnsignedInt5999Type:
    case UnsignedInt101111Type:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${type}.`);
}
class TextureUtils {
  static contain(texture, aspect) {
    return contain(texture, aspect);
  }
  static cover(texture, aspect) {
    return cover(texture, aspect);
  }
  static fill(texture) {
    return fill(texture);
  }
  static getByteLength(width, height, format, type) {
    return getByteLength(width, height, format, type);
  }
}

class VideoTexture extends Texture {
  constructor(video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy) {
    super(video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);
    this.minFilter = minFilter !== void 0 ? minFilter : LinearFilter;
    this.magFilter = magFilter !== void 0 ? magFilter : LinearFilter;
    this.generateMipmaps = false;
    const scope = this;
    function updateVideo() {
      scope.needsUpdate = true;
      video.requestVideoFrameCallback(updateVideo);
    }
    if ("requestVideoFrameCallback" in video) {
      video.requestVideoFrameCallback(updateVideo);
    }
  }
  get isVideoTexture() {
    return true;
  }
  /** @returns {this} */
  clone() {
    return new this.constructor(this.image).copy(this);
  }
  update() {
    const video = this.image;
    const hasVideoFrameCallback = "requestVideoFrameCallback" in video;
    if (hasVideoFrameCallback === false && video.readyState >= video.HAVE_CURRENT_DATA) {
      this.needsUpdate = true;
    }
  }
}

export { CompressedArrayTexture, CompressedCubeTexture, CompressedTexture, CubeDepthTexture, CubeTexture, Data3DTexture, DataArrayTexture, DataTexture, DepthTexture, ExternalTexture, FramebufferTexture, Source, Texture, TextureUtils, VideoTexture, contain, cover, fill, getByteLength };
