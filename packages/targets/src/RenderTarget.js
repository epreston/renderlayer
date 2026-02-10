import { EventDispatcher } from '@renderlayer/core';
import { Vector4 } from '@renderlayer/math';
import { LinearFilter } from '@renderlayer/shared';
import { Source, Texture } from '@renderlayer/textures';

/**
 * @import { DepthTexture } from '@renderlayer/textures';
 */

class RenderTarget extends EventDispatcher {
  width = 1;
  height = 1;
  depth = 1;

  scissor;
  scissorTest = false;

  viewport;
  textures = [];

  depthBuffer = true;
  stencilBuffer = false;

  resolveDepthBuffer = true;
  resolveStencilBuffer = true;

  #depthTexture = null;

  samples = 0;
  multiview = false;

  /*
   * In options, we can specify:
   * Texture parameters for an auto-generated target texture
   * depthBuffer/stencilBuffer: Booleans to indicate if we should generate these buffers
   */
  constructor(width = 1, height = 1, options = {}) {
    super();

    options = Object.assign(
      {
        generateMipmaps: false,
        internalFormat: null,
        minFilter: LinearFilter,
        depthBuffer: true,
        stencilBuffer: false,
        resolveDepthBuffer: true,
        resolveStencilBuffer: true,
        depthTexture: null,
        samples: 0,
        count: 1,
        depth: 1,
        multiview: false
      },
      options
    );

    this.width = width;
    this.height = height;
    this.depth = options.depth;

    this.scissor = new Vector4(0, 0, width, height);

    this.viewport = new Vector4(0, 0, width, height);

    const image = { width: width, height: height, depth: options.depth };
    const texture = new Texture(image);
    const count = options.count;
    for (let i = 0; i < count; i++) {
      this.textures[i] = texture.clone();
      this.textures[i].isRenderTargetTexture = true;
      this.textures[i].renderTarget = this;
    }

    this.#setTextureOptions(options);

    this.depthBuffer = options.depthBuffer;
    this.stencilBuffer = options.stencilBuffer;

    this.resolveDepthBuffer = options.resolveDepthBuffer;
    this.resolveStencilBuffer = options.resolveStencilBuffer;

    this.depthTexture = options.depthTexture;

    this.samples = options.samples;

    this.multiview = options.multiview;
  }

  get isRenderTarget() {
    return true;
  }

  /**
   * The texture representing the default color attachment.
   *
   * @type {Texture}
   */
  get texture() {
    return this.textures[0];
  }

  set texture(value) {
    this.textures[0] = value;
  }

  /**
   * Instead of saving the depth in a renderbuffer, a texture
   * can be used instead which is useful for further processing
   * e.g. in context of post-processing.
   *
   * @type {?DepthTexture}
   * @default null
   */
  get depthTexture() {
    return this.#depthTexture;
  }

  set depthTexture(current) {
    if (this.#depthTexture !== null) this.#depthTexture.renderTarget = null;
    if (current !== null) current.renderTarget = this;

    this.#depthTexture = current;
  }

  #setTextureOptions(options = {}) {
    const values = {
      minFilter: LinearFilter,
      generateMipmaps: false,
      flipY: false,
      internalFormat: null
    };

    if (options.mapping !== undefined) values.mapping = options.mapping;
    if (options.wrapS !== undefined) values.wrapS = options.wrapS;
    if (options.wrapT !== undefined) values.wrapT = options.wrapT;
    if (options.wrapR !== undefined) values.wrapR = options.wrapR;
    if (options.magFilter !== undefined) values.magFilter = options.magFilter;
    if (options.minFilter !== undefined) values.minFilter = options.minFilter;
    if (options.format !== undefined) values.format = options.format;
    if (options.type !== undefined) values.type = options.type;
    if (options.anisotropy !== undefined) values.anisotropy = options.anisotropy;
    if (options.colorSpace !== undefined) values.colorSpace = options.colorSpace;
    if (options.flipY !== undefined) values.flipY = options.flipY;
    if (options.generateMipmaps !== undefined) values.generateMipmaps = options.generateMipmaps;
    if (options.internalFormat !== undefined) values.internalFormat = options.internalFormat;

    for (let i = 0; i < this.textures.length; i++) {
      const texture = this.textures[i];
      texture.setValues(values);
    }
  }

  setSize(width, height, depth = 1) {
    if (this.width !== width || this.height !== height || this.depth !== depth) {
      this.width = width;
      this.height = height;
      this.depth = depth;

      for (let i = 0, il = this.textures.length; i < il; i++) {
        this.textures[i].image.width = width;
        this.textures[i].image.height = height;
        this.textures[i].image.depth = depth;

        if (this.textures[i].isData3DTexture !== true) {
          // Fix for #31693

          // TODO: Reconsider setting isArrayTexture flag here and in the ctor of Texture.
          // Maybe a method `isArrayTexture()` or just a getter could replace a flag since
          // both are evaluated on each call?

          this.textures[i].isArrayTexture = this.textures[i].image.depth > 1;
        }
      }

      this.dispose();
    }

    this.viewport.set(0, 0, width, height);
    this.scissor.set(0, 0, width, height);
  }

  /** @returns {this} */
  clone() {
    // @ts-ignore
    return new this.constructor().copy(this);
  }

  /** @param {RenderTarget} source */
  copy(source) {
    this.width = source.width;
    this.height = source.height;
    this.depth = source.depth;

    this.scissor.copy(source.scissor);
    this.scissorTest = source.scissorTest;

    this.viewport.copy(source.viewport);

    this.textures.length = 0;

    for (let i = 0, il = source.textures.length; i < il; i++) {
      this.textures[i] = source.textures[i].clone();
      this.textures[i].isRenderTargetTexture = true;
      this.textures[i].renderTarget = this;

      // ensure image object is not shared, see #20328

      const image = Object.assign({}, source.textures[i].image);
      this.textures[i].source = new Source(image);
    }

    this.depthBuffer = source.depthBuffer;
    this.stencilBuffer = source.stencilBuffer;

    this.resolveDepthBuffer = source.resolveDepthBuffer;
    this.resolveStencilBuffer = source.resolveStencilBuffer;

    if (source.depthTexture !== null) this.depthTexture = source.depthTexture.clone();

    this.samples = source.samples;

    return this;
  }

  dispose() {
    this.dispatchEvent({ type: 'dispose' });
  }
}

export { RenderTarget };
