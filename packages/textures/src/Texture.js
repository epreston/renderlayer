import { EventDispatcher } from '@renderlayer/core';
import { generateUUID, Matrix3, Vector2, Vector3 } from '@renderlayer/math';
import {
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  MirroredRepeatWrapping,
  NoColorSpace,
  RepeatWrapping,
  RGBAFormat,
  UnsignedByteType,
  UVMapping
} from '@renderlayer/shared';

import { Source } from './Source.js';

/**
 * @import { RenderTarget, WebGLRenderTarget } from '@renderlayer/targets';
 */

class Texture extends EventDispatcher {
  static DEFAULT_IMAGE = null;
  static DEFAULT_MAPPING = UVMapping;
  static DEFAULT_ANISOTROPY = 1;

  #id = _textureId++;

  uuid = generateUUID();

  name = '';

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

  constructor(
    image = Texture.DEFAULT_IMAGE,
    mapping = Texture.DEFAULT_MAPPING,
    wrapS = ClampToEdgeWrapping,
    wrapT = ClampToEdgeWrapping,
    magFilter = LinearFilter,
    minFilter = LinearMipmapLinearFilter,
    format = RGBAFormat,
    type = UnsignedByteType,
    anisotropy = Texture.DEFAULT_ANISOTROPY,
    colorSpace = NoColorSpace
  ) {
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
    // @ts-ignore
    return this.source.getSize(_tempVec3).z; // EP: issue, vector2 does not have z
  }

  get image() {
    return this.source.data;
  }

  set image(value) {
    // EP: check if undefined breaks
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
    return this.#needsPMREMUpdate; // EP: review
  }

  /** @type {boolean} */
  set needsPMREMUpdate(value) {
    this.#needsPMREMUpdate = value; // EP: review
    if (value === true) {
      this.pmremVersion++;
    }
  }

  updateMatrix() {
    // prettier-ignore
    this.matrix.setUvTransform(
      this.offset.x, this.offset.y,
      this.repeat.x, this.repeat.y,
      this.rotation,
      this.center.x, this.center.y
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
    // @ts-ignore
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

      if (newValue === undefined) {
        console.warn(`Texture.setValues(): parameter '${key}' has value of undefined.`);
        continue;
      }

      const currentValue = this[key];

      if (currentValue === undefined) {
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
    const isRootObject = meta === undefined || typeof meta === 'string';

    if (!isRootObject && meta.textures[this.uuid] !== undefined) {
      return meta.textures[this.uuid];
    }

    const output = {
      metadata: {
        version: 4.5,
        type: 'Texture',
        generator: 'Texture.toJSON'
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
    this.dispatchEvent({ type: 'dispose' });
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

const _tempVec3 = /*@__PURE__*/ new Vector3();

export { Texture };
