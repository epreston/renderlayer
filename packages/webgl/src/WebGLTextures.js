import { ColorManagement } from '@renderlayer/math';
import {
  AlwaysCompare,
  ClampToEdgeWrapping,
  DepthFormat,
  DepthStencilFormat,
  EqualCompare,
  FloatType,
  GreaterCompare,
  GreaterEqualCompare,
  // HalfFloatType,
  LessCompare,
  LessEqualCompare,
  LinearFilter,
  LinearMipmapLinearFilter,
  LinearMipmapNearestFilter,
  LinearSRGBColorSpace,
  LinearTransfer,
  MirroredRepeatWrapping,
  NearestFilter,
  NearestMipmapLinearFilter,
  NearestMipmapNearestFilter,
  NeverCompare,
  NoColorSpace,
  NotEqualCompare,
  RGBAFormat,
  RGB_ETC1_Format,
  RepeatWrapping,
  SRGBTransfer,
  UnsignedByteType,
  UnsignedInt248Type,
  UnsignedIntType,
  UnsignedShortType,
  _SRGBAFormat,
  createElementNS
} from '@renderlayer/shared';

class WebGLTextures {
  #gl;
  #extensions;
  #state;
  #properties;
  #capabilities;
  #utils;
  #info;

  #maxTextures;
  #maxCubemapSize;
  #maxTextureSize;
  #maxSamples;

  #supportsInvalidateFramebuffer;

  #useOffscreenCanvas = false;
  #canvas;

  #videoTextures = new WeakMap();
  #sources = new WeakMap(); // maps WebglTexture objects to instances of Source

  #textureUnits = 0;

  #wrappingToGL;
  #filterToGL;
  #compareToGL;

  onTextureDispose;
  onRenderTargetDispose;

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {import('./WebGLExtensions.js').WebGLExtensions} extensions
   * @param {import('./WebGLState.js').WebGLState} state
   * @param {import('./WebGLCapabilities.js').WebGLCapabilities} capabilities
   * @param {import('./WebGLUtils.js').WebGLUtils} utils
   * @param {import('./WebGLInfo.js').WebGLInfo} info
   */
  constructor(gl, extensions, state, properties, capabilities, utils, info) {
    this.#gl = gl;
    this.#extensions = extensions;
    this.#state = state;
    this.#properties = properties;
    this.#capabilities = capabilities;
    this.#utils = utils;
    this.#info = info;

    this.#maxTextures = capabilities.maxTextures;
    this.#maxCubemapSize = capabilities.maxCubemapSize;
    this.#maxTextureSize = capabilities.maxTextureSize;
    this.#maxSamples = capabilities.maxSamples;
    this.#supportsInvalidateFramebuffer =
      typeof navigator === 'undefined' ? false : /OculusBrowser/g.test(navigator.userAgent);

    // cordova iOS (as of 5.0) still uses UIWebView, which provides OffscreenCanvas,
    // also OffscreenCanvas.getContext("webgl"), but not OffscreenCanvas.getContext("2d")!
    // Some implementations may only implement OffscreenCanvas partially (e.g. lacking 2d).

    try {
      this.#useOffscreenCanvas =
        typeof OffscreenCanvas !== 'undefined' &&
        new OffscreenCanvas(1, 1).getContext('2d') !== null;
    } catch (err) {
      // Ignore any errors
    }

    this.#wrappingToGL = {
      [RepeatWrapping]: gl.REPEAT,
      [ClampToEdgeWrapping]: gl.CLAMP_TO_EDGE,
      [MirroredRepeatWrapping]: gl.MIRRORED_REPEAT
    };

    this.#filterToGL = {
      [NearestFilter]: gl.NEAREST,
      [NearestMipmapNearestFilter]: gl.NEAREST_MIPMAP_NEAREST,
      [NearestMipmapLinearFilter]: gl.NEAREST_MIPMAP_LINEAR,

      [LinearFilter]: gl.LINEAR,
      [LinearMipmapNearestFilter]: gl.LINEAR_MIPMAP_NEAREST,
      [LinearMipmapLinearFilter]: gl.LINEAR_MIPMAP_LINEAR
    };

    this.#compareToGL = {
      [NeverCompare]: gl.NEVER,
      [AlwaysCompare]: gl.ALWAYS,
      [LessCompare]: gl.LESS,
      [LessEqualCompare]: gl.LEQUAL,
      [EqualCompare]: gl.EQUAL,
      [GreaterEqualCompare]: gl.GEQUAL,
      [GreaterCompare]: gl.GREATER,
      [NotEqualCompare]: gl.NOTEQUAL
    };

    this.onTextureDispose = this.#onTextureDispose.bind(this);
    this.onRenderTargetDispose = this.#onRenderTargetDispose.bind(this);
  }

  #createCanvas(width, height) {
    // Use OffscreenCanvas when available. Specially needed in web workers
    return this.#useOffscreenCanvas ?
        new OffscreenCanvas(width, height)
      : createElementNS('canvas');
  }

  #resizeImage(image, needsNewCanvas, maxSize) {
    let scale = 1;

    // handle case if texture exceeds max size

    if (image.width > maxSize || image.height > maxSize) {
      scale = maxSize / Math.max(image.width, image.height);
    }

    // only perform resize if necessary

    if (scale < 1) {
      // only perform resize for certain image types

      if (
        (typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement) ||
        (typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement) ||
        (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap)
      ) {
        const width = Math.floor(scale * image.width);
        const height = Math.floor(scale * image.height);

        if (this.#canvas === undefined) this.#canvas = this.#createCanvas(width, height);

        // cube textures can't reuse the same canvas

        const canvas = needsNewCanvas ? this.#createCanvas(width, height) : this.#canvas;

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, width, height);

        console.warn(
          `WebGLRenderer: Texture has been resized from (${image.width}x${image.height}) to (${width}x${height}).`
        );

        return canvas;
      } else {
        if ('data' in image) {
          console.warn(
            `WebGLRenderer: Image in DataTexture is too big (${image.width}x${image.height}).`
          );
        }

        return image;
      }
    }

    return image;
  }

  #textureNeedsGenerateMipmaps(texture, supportsMips) {
    return (
      texture.generateMipmaps &&
      supportsMips &&
      texture.minFilter !== NearestFilter &&
      texture.minFilter !== LinearFilter
    );
  }

  #generateMipmap(target) {
    this.#gl.generateMipmap(target);
  }

  #getInternalFormat(
    internalFormatName,
    glFormat,
    glType,
    colorSpace,
    forceLinearTransfer = false
  ) {
    const gl = this.#gl;

    if (internalFormatName !== null) {
      if (gl[internalFormatName] !== undefined) return gl[internalFormatName];

      console.warn(
        `WebGLRenderer: Attempt to use non-existing WebGL internal format '${internalFormatName}'`
      );
    }

    let internalFormat = glFormat;

    if (glFormat === gl.RED) {
      if (glType === gl.FLOAT) internalFormat = gl.R32F;
      if (glType === gl.HALF_FLOAT) internalFormat = gl.R16F;
      if (glType === gl.UNSIGNED_BYTE) internalFormat = gl.R8;
    }

    if (glFormat === gl.RED_INTEGER) {
      if (glType === gl.UNSIGNED_BYTE) internalFormat = gl.R8UI;
      if (glType === gl.UNSIGNED_SHORT) internalFormat = gl.R16UI;
      if (glType === gl.UNSIGNED_INT) internalFormat = gl.R32UI;
      if (glType === gl.BYTE) internalFormat = gl.R8I;
      if (glType === gl.SHORT) internalFormat = gl.R16I;
      if (glType === gl.INT) internalFormat = gl.R32I;
    }

    if (glFormat === gl.RG) {
      if (glType === gl.FLOAT) internalFormat = gl.RG32F;
      if (glType === gl.HALF_FLOAT) internalFormat = gl.RG16F;
      if (glType === gl.UNSIGNED_BYTE) internalFormat = gl.RG8;
    }

    if (glFormat === gl.RGBA) {
      const transfer =
        forceLinearTransfer ? LinearTransfer : ColorManagement.getTransfer(colorSpace);

      if (glType === gl.FLOAT) internalFormat = gl.RGBA32F;
      if (glType === gl.HALF_FLOAT) internalFormat = gl.RGBA16F;
      if (glType === gl.UNSIGNED_BYTE)
        internalFormat = transfer === SRGBTransfer ? gl.SRGB8_ALPHA8 : gl.RGBA8;
      if (glType === gl.UNSIGNED_SHORT_4_4_4_4) internalFormat = gl.RGBA4;
      if (glType === gl.UNSIGNED_SHORT_5_5_5_1) internalFormat = gl.RGB5_A1;
    }

    if (
      internalFormat === gl.R16F ||
      internalFormat === gl.R32F ||
      internalFormat === gl.RG16F ||
      internalFormat === gl.RG32F ||
      internalFormat === gl.RGBA16F ||
      internalFormat === gl.RGBA32F
    ) {
      this.#extensions.get('EXT_color_buffer_float');
    }

    return internalFormat;
  }

  #getMipLevels(texture, image, supportsMips) {
    if (
      this.#textureNeedsGenerateMipmaps(texture, supportsMips) === true ||
      (texture.isFramebufferTexture &&
        texture.minFilter !== NearestFilter &&
        texture.minFilter !== LinearFilter)
    ) {
      // EP: floor mip map levels.
      // return Math.log2(Math.max(image.width, image.height)) + 1;
      return 1 + Math.floor(Math.log2(Math.max(image.width, image.height)));
    } else if (texture.mipmaps !== undefined && texture.mipmaps.length > 0) {
      // user-defined mipmaps

      return texture.mipmaps.length;
    } else if (texture.isCompressedTexture && Array.isArray(texture.image)) {
      return image.mipmaps.length;
    } else {
      // texture without mipmaps (only base level)

      return 1;
    }
  }

  // Fallback filters for non-power-of-2 textures

  #filterFallback(f) {
    const gl = this.#gl;

    if (
      f === NearestFilter ||
      f === NearestMipmapNearestFilter ||
      f === NearestMipmapLinearFilter
    ) {
      return gl.NEAREST;
    }

    return gl.LINEAR;
  }

  //

  #onTextureDispose(event) {
    const texture = event.target;

    texture.removeEventListener('dispose', this.onTextureDispose);

    this.#deallocateTexture(texture);

    if (texture.isVideoTexture) {
      this.#videoTextures.delete(texture);
    }
  }

  #onRenderTargetDispose(event) {
    const renderTarget = event.target;

    renderTarget.removeEventListener('dispose', this.onRenderTargetDispose);

    this.#deallocateRenderTarget(renderTarget);
  }

  //

  #deallocateTexture(texture) {
    const textureProperties = this.#properties.get(texture);

    if (textureProperties.__webglInit === undefined) return;

    // check if it's necessary to remove the WebGLTexture object

    const source = texture.source;
    const webglTextures = this.#sources.get(source);

    if (webglTextures) {
      const webglTexture = webglTextures[textureProperties.__cacheKey];
      webglTexture.usedTimes--;

      // the WebGLTexture object is not used any more, remove it

      if (webglTexture.usedTimes === 0) {
        this.#deleteTexture(texture);
      }

      // remove the weak map entry if no WebGLTexture uses the source any more

      if (Object.keys(webglTextures).length === 0) {
        this.#sources.delete(source);
      }
    }

    this.#properties.remove(texture);
  }

  #deleteTexture(texture) {
    const textureProperties = this.#properties.get(texture);
    this.#gl.deleteTexture(textureProperties.__webglTexture);

    const source = texture.source;
    const webglTextures = this.#sources.get(source);
    delete webglTextures[textureProperties.__cacheKey];

    this.#info.memory.textures--;
  }

  #deallocateRenderTarget(renderTarget) {
    const gl = this.#gl;
    const properties = this.#properties;

    const texture = renderTarget.texture;

    const renderTargetProperties = properties.get(renderTarget);
    const textureProperties = properties.get(texture);

    if (textureProperties.__webglTexture !== undefined) {
      gl.deleteTexture(textureProperties.__webglTexture);

      this.#info.memory.textures--;
    }

    if (renderTarget.depthTexture) {
      renderTarget.depthTexture.dispose();
    }

    if (renderTarget.isWebGLCubeRenderTarget) {
      for (let i = 0; i < 6; i++) {
        if (Array.isArray(renderTargetProperties.__webglFramebuffer[i])) {
          for (let level = 0; level < renderTargetProperties.__webglFramebuffer[i].length; level++)
            gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer[i][level]);
        } else {
          gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer[i]);
        }

        if (renderTargetProperties.__webglDepthbuffer)
          gl.deleteRenderbuffer(renderTargetProperties.__webglDepthbuffer[i]);
      }
    } else {
      if (Array.isArray(renderTargetProperties.__webglFramebuffer)) {
        for (let level = 0; level < renderTargetProperties.__webglFramebuffer.length; level++)
          gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer[level]);
      } else {
        gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer);
      }

      if (renderTargetProperties.__webglDepthbuffer)
        gl.deleteRenderbuffer(renderTargetProperties.__webglDepthbuffer);
      if (renderTargetProperties.__webglMultisampledFramebuffer)
        gl.deleteFramebuffer(renderTargetProperties.__webglMultisampledFramebuffer);

      if (renderTargetProperties.__webglColorRenderbuffer) {
        for (let i = 0; i < renderTargetProperties.__webglColorRenderbuffer.length; i++) {
          if (renderTargetProperties.__webglColorRenderbuffer[i])
            gl.deleteRenderbuffer(renderTargetProperties.__webglColorRenderbuffer[i]);
        }
      }

      if (renderTargetProperties.__webglDepthRenderbuffer)
        gl.deleteRenderbuffer(renderTargetProperties.__webglDepthRenderbuffer);
    }

    if (renderTarget.isWebGLMultipleRenderTargets) {
      for (let i = 0, il = texture.length; i < il; i++) {
        const attachmentProperties = properties.get(texture[i]);

        if (attachmentProperties.__webglTexture) {
          gl.deleteTexture(attachmentProperties.__webglTexture);

          this.#info.memory.textures--;
        }

        properties.remove(texture[i]);
      }
    }

    properties.remove(texture);
    properties.remove(renderTarget);
  }

  //

  resetTextureUnits() {
    this.#textureUnits = 0;
  }

  allocateTextureUnit() {
    const textureUnit = this.#textureUnits;

    if (textureUnit >= this.#maxTextures) {
      console.warn(
        `WebGLTextures: Trying to use ${textureUnit} texture units while this GPU supports only ${this.#maxTextures}`
      );
    }

    this.#textureUnits += 1;

    return textureUnit;
  }

  #getTextureCacheKey(texture) {
    const array = [];

    array.push(texture.wrapS);
    array.push(texture.wrapT);
    array.push(texture.wrapR || 0);
    array.push(texture.magFilter);
    array.push(texture.minFilter);
    array.push(texture.anisotropy);
    array.push(texture.internalFormat);
    array.push(texture.format);
    array.push(texture.type);
    array.push(texture.generateMipmaps);
    array.push(texture.premultiplyAlpha);
    array.push(texture.flipY);
    array.push(texture.unpackAlignment);
    array.push(texture.colorSpace);

    return array.join();
  }

  //

  setTexture2D(texture, slot) {
    const gl = this.#gl;
    const textureProperties = this.#properties.get(texture);

    if (texture.isVideoTexture) this.#updateVideoTexture(texture);

    if (
      texture.isRenderTargetTexture === false &&
      texture.version > 0 &&
      textureProperties.__version !== texture.version
    ) {
      const image = texture.image;

      if (image === null) {
        console.warn('WebGLRenderer: Texture marked for update but no image data found.');
      } else if (image.complete === false) {
        console.warn('WebGLRenderer: Texture marked for update but image is incomplete');
      } else {
        this.#uploadTexture(textureProperties, texture, slot);
        return;
      }
    }

    this.#state.bindTexture(gl.TEXTURE_2D, textureProperties.__webglTexture, gl.TEXTURE0 + slot);
  }

  setTexture2DArray(texture, slot) {
    const gl = this.#gl;
    const textureProperties = this.#properties.get(texture);

    if (texture.version > 0 && textureProperties.__version !== texture.version) {
      this.#uploadTexture(textureProperties, texture, slot);
      return;
    }

    this.#state.bindTexture(
      gl.TEXTURE_2D_ARRAY,
      textureProperties.__webglTexture,
      gl.TEXTURE0 + slot
    );
  }

  setTexture3D(texture, slot) {
    const gl = this.#gl;
    const textureProperties = this.#properties.get(texture);

    if (texture.version > 0 && textureProperties.__version !== texture.version) {
      this.#uploadTexture(textureProperties, texture, slot);
      return;
    }

    this.#state.bindTexture(gl.TEXTURE_3D, textureProperties.__webglTexture, gl.TEXTURE0 + slot);
  }

  setTextureCube(texture, slot) {
    const gl = this.#gl;
    const textureProperties = this.#properties.get(texture);

    if (texture.version > 0 && textureProperties.__version !== texture.version) {
      this.#uploadCubeTexture(textureProperties, texture, slot);
      return;
    }

    this.#state.bindTexture(
      gl.TEXTURE_CUBE_MAP,
      textureProperties.__webglTexture,
      gl.TEXTURE0 + slot
    );
  }

  #setTextureParameters(textureType, texture, supportsMips) {
    const gl = this.#gl;
    const extensions = this.#extensions;
    const properties = this.#properties;

    if (supportsMips) {
      gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, this.#wrappingToGL[texture.wrapS]);
      gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, this.#wrappingToGL[texture.wrapT]);

      if (textureType === gl.TEXTURE_3D || textureType === gl.TEXTURE_2D_ARRAY) {
        gl.texParameteri(textureType, gl.TEXTURE_WRAP_R, this.#wrappingToGL[texture.wrapR]);
      }

      gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, this.#filterToGL[texture.magFilter]);
      gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, this.#filterToGL[texture.minFilter]);
    } else {
      gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      if (textureType === gl.TEXTURE_3D || textureType === gl.TEXTURE_2D_ARRAY) {
        gl.texParameteri(textureType, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
      }

      if (texture.wrapS !== ClampToEdgeWrapping || texture.wrapT !== ClampToEdgeWrapping) {
        console.warn(
          'WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to ClampToEdgeWrapping.'
        );
      }

      gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, this.#filterFallback(texture.magFilter));
      gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, this.#filterFallback(texture.minFilter));

      if (texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter) {
        console.warn(
          'WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to NearestFilter or LinearFilter.'
        );
      }
    }

    if (texture.compareFunction) {
      gl.texParameteri(textureType, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
      gl.texParameteri(
        textureType,
        gl.TEXTURE_COMPARE_FUNC,
        this.#compareToGL[texture.compareFunction]
      );
    }

    if (extensions.has('EXT_texture_filter_anisotropic') === true) {
      const extension = extensions.get('EXT_texture_filter_anisotropic');

      if (texture.magFilter === NearestFilter) return;
      if (
        texture.minFilter !== NearestMipmapLinearFilter &&
        texture.minFilter !== LinearMipmapLinearFilter
      )
        return;
      if (texture.type === FloatType && extensions.has('OES_texture_float_linear') === false)
        return; // verify extension for WebGL 1 and WebGL 2

      if (texture.anisotropy > 1 || properties.get(texture).__currentAnisotropy) {
        gl.texParameterf(
          textureType,
          extension.TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(texture.anisotropy, this.#capabilities.getMaxAnisotropy())
        );
        properties.get(texture).__currentAnisotropy = texture.anisotropy;
      }
    }
  }

  #initTexture(textureProperties, texture) {
    let forceUpload = false;

    if (textureProperties.__webglInit === undefined) {
      textureProperties.__webglInit = true;

      texture.addEventListener('dispose', this.onTextureDispose);
    }

    // create Source <-> WebGLTextures mapping if necessary

    const source = texture.source;
    let webglTextures = this.#sources.get(source);

    if (webglTextures === undefined) {
      webglTextures = {};
      this.#sources.set(source, webglTextures);
    }

    // check if there is already a WebGLTexture object for the given texture parameters

    const textureCacheKey = this.#getTextureCacheKey(texture);

    if (textureCacheKey !== textureProperties.__cacheKey) {
      // if not, create a new instance of WebGLTexture

      if (webglTextures[textureCacheKey] === undefined) {
        // create new entry

        webglTextures[textureCacheKey] = {
          texture: this.#gl.createTexture(),
          usedTimes: 0
        };

        this.#info.memory.textures++;

        // when a new instance of WebGLTexture was created, a texture upload is required
        // even if the image contents are identical

        forceUpload = true;
      }

      webglTextures[textureCacheKey].usedTimes++;

      // every time the texture cache key changes, it's necessary to check if an instance of
      // WebGLTexture can be deleted in order to avoid a memory leak.

      const webglTexture = webglTextures[textureProperties.__cacheKey];

      if (webglTexture !== undefined) {
        webglTextures[textureProperties.__cacheKey].usedTimes--;

        if (webglTexture.usedTimes === 0) {
          this.#deleteTexture(texture);
        }
      }

      // store references to cache key and WebGLTexture object

      textureProperties.__cacheKey = textureCacheKey;
      textureProperties.__webglTexture = webglTextures[textureCacheKey].texture;
    }

    return forceUpload;
  }

  #uploadTexture(textureProperties, texture, slot) {
    const gl = this.#gl;
    const properties = this.#properties;
    const state = this.#state;
    const utils = this.#utils;

    let textureType; // appease type checking
    textureType = gl.TEXTURE_2D;

    if (texture.isDataArrayTexture || texture.isCompressedArrayTexture)
      textureType = gl.TEXTURE_2D_ARRAY;
    if (texture.isData3DTexture) textureType = gl.TEXTURE_3D;

    const forceUpload = this.#initTexture(textureProperties, texture);
    const source = texture.source;

    state.bindTexture(textureType, textureProperties.__webglTexture, gl.TEXTURE0 + slot);

    const sourceProperties = properties.get(source);

    if (source.version !== sourceProperties.__version || forceUpload === true) {
      state.activeTexture(gl.TEXTURE0 + slot);

      const workingPrimaries = ColorManagement.getPrimaries(ColorManagement.workingColorSpace);
      const texturePrimaries =
        texture.colorSpace === NoColorSpace ?
          null
        : ColorManagement.getPrimaries(texture.colorSpace);
      const unpackConversion =
        texture.colorSpace === NoColorSpace || workingPrimaries === texturePrimaries ?
          gl.NONE
        : gl.BROWSER_DEFAULT_WEBGL;

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, unpackConversion);

      let image = this.#resizeImage(texture.image, false, this.#maxTextureSize);
      image = this.#verifyColorSpace(texture, image);

      const supportsMips = true;

      const glFormat = utils.convert(texture.format, texture.colorSpace);

      let glType = utils.convert(texture.type);
      let glInternalFormat = this.#getInternalFormat(
        texture.internalFormat,
        glFormat,
        glType,
        texture.colorSpace,
        texture.isVideoTexture
      );

      this.#setTextureParameters(textureType, texture, supportsMips);

      let mipmap;
      const mipmaps = texture.mipmaps;

      const useTexStorage = texture.isVideoTexture !== true && glInternalFormat !== RGB_ETC1_Format;
      const allocateMemory = sourceProperties.__version === undefined || forceUpload === true;
      const levels = this.#getMipLevels(texture, image, supportsMips);

      if (texture.isDepthTexture) {
        // populate depth texture with dummy data

        glInternalFormat = gl.DEPTH_COMPONENT;

        if (texture.type === FloatType) {
          glInternalFormat = gl.DEPTH_COMPONENT32F;
        } else if (texture.type === UnsignedIntType) {
          glInternalFormat = gl.DEPTH_COMPONENT24;
        } else if (texture.type === UnsignedInt248Type) {
          glInternalFormat = gl.DEPTH24_STENCIL8;
        } else {
          glInternalFormat = gl.DEPTH_COMPONENT16; // WebGL2 requires sized internalformat for glTexImage2D
        }

        // validation checks for WebGL 1

        if (texture.format === DepthFormat && glInternalFormat === gl.DEPTH_COMPONENT) {
          // The error INVALID_OPERATION is generated by texImage2D if format and internalformat are
          // DEPTH_COMPONENT and type is not UNSIGNED_SHORT or UNSIGNED_INT
          // (https://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/)
          if (texture.type !== UnsignedShortType && texture.type !== UnsignedIntType) {
            console.warn(
              'WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture.'
            );

            texture.type = UnsignedIntType;
            glType = utils.convert(texture.type);
          }
        }

        if (texture.format === DepthStencilFormat && glInternalFormat === gl.DEPTH_COMPONENT) {
          // Depth stencil textures need the DEPTH_STENCIL internal format
          // (https://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/)
          glInternalFormat = gl.DEPTH_STENCIL;

          // The error INVALID_OPERATION is generated by texImage2D if format and internalformat are
          // DEPTH_STENCIL and type is not UNSIGNED_INT_24_8_WEBGL.
          // (https://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/)
          if (texture.type !== UnsignedInt248Type) {
            console.warn(
              'WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture.'
            );

            texture.type = UnsignedInt248Type;
            glType = this.#utils.convert(texture.type);
          }
        }

        //

        if (allocateMemory) {
          if (useTexStorage) {
            state.texStorage2D(gl.TEXTURE_2D, 1, glInternalFormat, image.width, image.height);
          } else {
            state.texImage2D(
              gl.TEXTURE_2D,
              0,
              glInternalFormat,
              image.width,
              image.height,
              0,
              glFormat,
              glType,
              null
            );
          }
        }
      } else if (texture.isDataTexture) {
        // use manually created mipmaps if available
        // if there are no manual mipmaps
        // set 0 level mipmap and then use GL to generate other mipmap levels

        if (mipmaps.length > 0 && supportsMips) {
          if (useTexStorage && allocateMemory) {
            state.texStorage2D(
              gl.TEXTURE_2D,
              levels,
              glInternalFormat,
              mipmaps[0].width,
              mipmaps[0].height
            );
          }

          for (let i = 0, il = mipmaps.length; i < il; i++) {
            mipmap = mipmaps[i];

            if (useTexStorage) {
              state.texSubImage2D(
                gl.TEXTURE_2D,
                i,
                0,
                0,
                mipmap.width,
                mipmap.height,
                glFormat,
                glType,
                mipmap.data
              );
            } else {
              state.texImage2D(
                gl.TEXTURE_2D,
                i,
                glInternalFormat,
                mipmap.width,
                mipmap.height,
                0,
                glFormat,
                glType,
                mipmap.data
              );
            }
          }

          texture.generateMipmaps = false;
        } else {
          if (useTexStorage) {
            if (allocateMemory) {
              state.texStorage2D(
                gl.TEXTURE_2D,
                levels,
                glInternalFormat,
                image.width,
                image.height
              );
            }

            state.texSubImage2D(
              gl.TEXTURE_2D,
              0,
              0,
              0,
              image.width,
              image.height,
              glFormat,
              glType,
              image.data
            );
          } else {
            state.texImage2D(
              gl.TEXTURE_2D,
              0,
              glInternalFormat,
              image.width,
              image.height,
              0,
              glFormat,
              glType,
              image.data
            );
          }
        }
      } else if (texture.isCompressedTexture) {
        if (texture.isCompressedArrayTexture) {
          if (useTexStorage && allocateMemory) {
            state.texStorage3D(
              gl.TEXTURE_2D_ARRAY,
              levels,
              glInternalFormat,
              mipmaps[0].width,
              mipmaps[0].height,
              image.depth
            );
          }

          for (let i = 0, il = mipmaps.length; i < il; i++) {
            mipmap = mipmaps[i];

            if (texture.format !== RGBAFormat) {
              if (glFormat !== null) {
                if (useTexStorage) {
                  state.compressedTexSubImage3D(
                    gl.TEXTURE_2D_ARRAY,
                    i,
                    0,
                    0,
                    0,
                    mipmap.width,
                    mipmap.height,
                    image.depth,
                    glFormat,
                    mipmap.data,
                    0,
                    0
                  );
                } else {
                  state.compressedTexImage3D(
                    gl.TEXTURE_2D_ARRAY,
                    i,
                    glInternalFormat,
                    mipmap.width,
                    mipmap.height,
                    image.depth,
                    0,
                    mipmap.data,
                    0,
                    0
                  );
                }
              } else {
                console.warn(
                  'WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()'
                );
              }
            } else {
              if (useTexStorage) {
                state.texSubImage3D(
                  gl.TEXTURE_2D_ARRAY,
                  i,
                  0,
                  0,
                  0,
                  mipmap.width,
                  mipmap.height,
                  image.depth,
                  glFormat,
                  glType,
                  mipmap.data
                );
              } else {
                state.texImage3D(
                  gl.TEXTURE_2D_ARRAY,
                  i,
                  glInternalFormat,
                  mipmap.width,
                  mipmap.height,
                  image.depth,
                  0,
                  glFormat,
                  glType,
                  mipmap.data
                );
              }
            }
          }
        } else {
          if (useTexStorage && allocateMemory) {
            state.texStorage2D(
              gl.TEXTURE_2D,
              levels,
              glInternalFormat,
              mipmaps[0].width,
              mipmaps[0].height
            );
          }

          for (let i = 0, il = mipmaps.length; i < il; i++) {
            mipmap = mipmaps[i];

            if (texture.format !== RGBAFormat) {
              if (glFormat !== null) {
                if (useTexStorage) {
                  state.compressedTexSubImage2D(
                    gl.TEXTURE_2D,
                    i,
                    0,
                    0,
                    mipmap.width,
                    mipmap.height,
                    glFormat,
                    mipmap.data
                  );
                } else {
                  state.compressedTexImage2D(
                    gl.TEXTURE_2D,
                    i,
                    glInternalFormat,
                    mipmap.width,
                    mipmap.height,
                    0,
                    mipmap.data
                  );
                }
              } else {
                console.warn(
                  'WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()'
                );
              }
            } else {
              if (useTexStorage) {
                state.texSubImage2D(
                  gl.TEXTURE_2D,
                  i,
                  0,
                  0,
                  mipmap.width,
                  mipmap.height,
                  glFormat,
                  glType,
                  mipmap.data
                );
              } else {
                state.texImage2D(
                  gl.TEXTURE_2D,
                  i,
                  glInternalFormat,
                  mipmap.width,
                  mipmap.height,
                  0,
                  glFormat,
                  glType,
                  mipmap.data
                );
              }
            }
          }
        }
      } else if (texture.isDataArrayTexture) {
        if (useTexStorage) {
          if (allocateMemory) {
            state.texStorage3D(
              gl.TEXTURE_2D_ARRAY,
              levels,
              glInternalFormat,
              image.width,
              image.height,
              image.depth
            );
          }

          state.texSubImage3D(
            gl.TEXTURE_2D_ARRAY,
            0,
            0,
            0,
            0,
            image.width,
            image.height,
            image.depth,
            glFormat,
            glType,
            image.data
          );
        } else {
          state.texImage3D(
            gl.TEXTURE_2D_ARRAY,
            0,
            glInternalFormat,
            image.width,
            image.height,
            image.depth,
            0,
            glFormat,
            glType,
            image.data
          );
        }
      } else if (texture.isData3DTexture) {
        if (useTexStorage) {
          if (allocateMemory) {
            state.texStorage3D(
              gl.TEXTURE_3D,
              levels,
              glInternalFormat,
              image.width,
              image.height,
              image.depth
            );
          }

          state.texSubImage3D(
            gl.TEXTURE_3D,
            0,
            0,
            0,
            0,
            image.width,
            image.height,
            image.depth,
            glFormat,
            glType,
            image.data
          );
        } else {
          state.texImage3D(
            gl.TEXTURE_3D,
            0,
            glInternalFormat,
            image.width,
            image.height,
            image.depth,
            0,
            glFormat,
            glType,
            image.data
          );
        }
      } else if (texture.isFramebufferTexture) {
        if (allocateMemory) {
          if (useTexStorage) {
            state.texStorage2D(gl.TEXTURE_2D, levels, glInternalFormat, image.width, image.height);
          } else {
            let width = image.width;
            let height = image.height;

            for (let i = 0; i < levels; i++) {
              state.texImage2D(
                gl.TEXTURE_2D,
                i,
                glInternalFormat,
                width,
                height,
                0,
                glFormat,
                glType,
                null
              );

              width >>= 1;
              height >>= 1;
            }
          }
        }
      } else {
        // regular Texture (image, video, canvas)

        // use manually created mipmaps if available
        // if there are no manual mipmaps
        // set 0 level mipmap and then use GL to generate other mipmap levels

        if (mipmaps.length > 0 && supportsMips) {
          if (useTexStorage && allocateMemory) {
            state.texStorage2D(
              gl.TEXTURE_2D,
              levels,
              glInternalFormat,
              mipmaps[0].width,
              mipmaps[0].height
            );
          }

          for (let i = 0, il = mipmaps.length; i < il; i++) {
            mipmap = mipmaps[i];

            if (useTexStorage) {
              state.texSubImage2D(gl.TEXTURE_2D, i, 0, 0, glFormat, glType, mipmap);
            } else {
              state.texImage2D(gl.TEXTURE_2D, i, glInternalFormat, glFormat, glType, mipmap);
            }
          }

          texture.generateMipmaps = false;
        } else {
          if (useTexStorage) {
            if (allocateMemory) {
              state.texStorage2D(
                gl.TEXTURE_2D,
                levels,
                glInternalFormat,
                image.width,
                image.height
              );
            }

            state.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, glFormat, glType, image);
          } else {
            state.texImage2D(gl.TEXTURE_2D, 0, glInternalFormat, glFormat, glType, image);
          }
        }
      }

      if (this.#textureNeedsGenerateMipmaps(texture, supportsMips)) {
        this.#generateMipmap(textureType);
      }

      sourceProperties.__version = source.version;

      if (texture.onUpdate) texture.onUpdate(texture);
    }

    textureProperties.__version = texture.version;
  }

  #uploadCubeTexture(textureProperties, texture, slot) {
    const gl = this.#gl;
    const state = this.#state;

    if (texture.image.length !== 6) return;

    const forceUpload = this.#initTexture(textureProperties, texture);
    const source = texture.source;

    state.bindTexture(gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture, gl.TEXTURE0 + slot);

    const sourceProperties = this.#properties.get(source);

    if (source.version !== sourceProperties.__version || forceUpload === true) {
      state.activeTexture(gl.TEXTURE0 + slot);

      const workingPrimaries = ColorManagement.getPrimaries(ColorManagement.workingColorSpace);
      const texturePrimaries =
        texture.colorSpace === NoColorSpace ?
          null
        : ColorManagement.getPrimaries(texture.colorSpace);
      const unpackConversion =
        texture.colorSpace === NoColorSpace || workingPrimaries === texturePrimaries ?
          gl.NONE
        : gl.BROWSER_DEFAULT_WEBGL;

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, unpackConversion);

      const isCompressed = texture.isCompressedTexture || texture.image[0].isCompressedTexture;
      const isDataTexture = texture.image[0] && texture.image[0].isDataTexture;

      const cubeImage = [];

      for (let i = 0; i < 6; i++) {
        if (!isCompressed && !isDataTexture) {
          cubeImage[i] = this.#resizeImage(texture.image[i], true, this.#maxCubemapSize);
        } else {
          cubeImage[i] = isDataTexture ? texture.image[i].image : texture.image[i];
        }

        cubeImage[i] = this.#verifyColorSpace(texture, cubeImage[i]);
      }

      const image = cubeImage[0];

      const supportsMips = true;

      const glFormat = this.#utils.convert(texture.format, texture.colorSpace);
      const glType = this.#utils.convert(texture.type);
      const glInternalFormat = this.#getInternalFormat(
        texture.internalFormat,
        glFormat,
        glType,
        texture.colorSpace
      );

      const useTexStorage = texture.isVideoTexture !== true;

      const allocateMemory = sourceProperties.__version === undefined || forceUpload === true;
      let levels = this.#getMipLevels(texture, image, supportsMips);

      this.#setTextureParameters(gl.TEXTURE_CUBE_MAP, texture, supportsMips);

      let mipmaps;

      if (isCompressed) {
        if (useTexStorage && allocateMemory) {
          state.texStorage2D(
            gl.TEXTURE_CUBE_MAP,
            levels,
            glInternalFormat,
            image.width,
            image.height
          );
        }

        for (let i = 0; i < 6; i++) {
          mipmaps = cubeImage[i].mipmaps;

          for (let j = 0; j < mipmaps.length; j++) {
            const mipmap = mipmaps[j];

            if (texture.format !== RGBAFormat) {
              if (glFormat !== null) {
                if (useTexStorage) {
                  state.compressedTexSubImage2D(
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                    j,
                    0,
                    0,
                    mipmap.width,
                    mipmap.height,
                    glFormat,
                    mipmap.data
                  );
                } else {
                  state.compressedTexImage2D(
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                    j,
                    glInternalFormat,
                    mipmap.width,
                    mipmap.height,
                    0,
                    mipmap.data
                  );
                }
              } else {
                console.warn(
                  'WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()'
                );
              }
            } else {
              if (useTexStorage) {
                state.texSubImage2D(
                  gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                  j,
                  0,
                  0,
                  mipmap.width,
                  mipmap.height,
                  glFormat,
                  glType,
                  mipmap.data
                );
              } else {
                state.texImage2D(
                  gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                  j,
                  glInternalFormat,
                  mipmap.width,
                  mipmap.height,
                  0,
                  glFormat,
                  glType,
                  mipmap.data
                );
              }
            }
          }
        }
      } else {
        mipmaps = texture.mipmaps;

        if (useTexStorage && allocateMemory) {
          // TODO: Uniformly handle mipmap definitions
          // Normal textures and compressed cube textures define base level + mips with their mipmap array
          // Uncompressed cube textures use their mipmap array only for mips (no base level)

          if (mipmaps.length > 0) levels++;

          state.texStorage2D(
            gl.TEXTURE_CUBE_MAP,
            levels,
            glInternalFormat,
            cubeImage[0].width,
            cubeImage[0].height
          );
        }

        for (let i = 0; i < 6; i++) {
          if (isDataTexture) {
            if (useTexStorage) {
              state.texSubImage2D(
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                0,
                0,
                0,
                cubeImage[i].width,
                cubeImage[i].height,
                glFormat,
                glType,
                cubeImage[i].data
              );
            } else {
              state.texImage2D(
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                0,
                glInternalFormat,
                cubeImage[i].width,
                cubeImage[i].height,
                0,
                glFormat,
                glType,
                cubeImage[i].data
              );
            }

            for (let j = 0; j < mipmaps.length; j++) {
              const mipmap = mipmaps[j];
              const mipmapImage = mipmap.image[i].image;

              if (useTexStorage) {
                state.texSubImage2D(
                  gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                  j + 1,
                  0,
                  0,
                  mipmapImage.width,
                  mipmapImage.height,
                  glFormat,
                  glType,
                  mipmapImage.data
                );
              } else {
                state.texImage2D(
                  gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                  j + 1,
                  glInternalFormat,
                  mipmapImage.width,
                  mipmapImage.height,
                  0,
                  glFormat,
                  glType,
                  mipmapImage.data
                );
              }
            }
          } else {
            if (useTexStorage) {
              state.texSubImage2D(
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                0,
                0,
                0,
                glFormat,
                glType,
                cubeImage[i]
              );
            } else {
              state.texImage2D(
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                0,
                glInternalFormat,
                glFormat,
                glType,
                cubeImage[i]
              );
            }

            for (let j = 0; j < mipmaps.length; j++) {
              const mipmap = mipmaps[j];

              if (useTexStorage) {
                state.texSubImage2D(
                  gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                  j + 1,
                  0,
                  0,
                  glFormat,
                  glType,
                  mipmap.image[i]
                );
              } else {
                state.texImage2D(
                  gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                  j + 1,
                  glInternalFormat,
                  glFormat,
                  glType,
                  mipmap.image[i]
                );
              }
            }
          }
        }
      }

      if (this.#textureNeedsGenerateMipmaps(texture, supportsMips)) {
        // We assume images for cube map have the same size.
        this.#generateMipmap(gl.TEXTURE_CUBE_MAP);
      }

      sourceProperties.__version = source.version;

      if (texture.onUpdate) texture.onUpdate(texture);
    }

    textureProperties.__version = texture.version;
  }

  // Render targets

  // Setup storage for target texture and bind it to correct framebuffer
  setupFrameBufferTexture(framebuffer, renderTarget, texture, attachment, textureTarget, level) {
    const gl = this.#gl;
    const state = this.#state;

    const glFormat = this.#utils.convert(texture.format, texture.colorSpace);
    const glType = this.#utils.convert(texture.type);
    const glInternalFormat = this.#getInternalFormat(
      texture.internalFormat,
      glFormat,
      glType,
      texture.colorSpace
    );
    const renderTargetProperties = this.#properties.get(renderTarget);

    if (!renderTargetProperties.__hasExternalTextures) {
      const width = Math.max(1, renderTarget.width >> level);
      const height = Math.max(1, renderTarget.height >> level);

      if (textureTarget === gl.TEXTURE_3D || textureTarget === gl.TEXTURE_2D_ARRAY) {
        state.texImage3D(
          textureTarget,
          level,
          glInternalFormat,
          width,
          height,
          renderTarget.depth,
          0,
          glFormat,
          glType,
          null
        );
      } else {
        state.texImage2D(
          textureTarget,
          level,
          glInternalFormat,
          width,
          height,
          0,
          glFormat,
          glType,
          null
        );
      }
    }

    state.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    if (
      textureTarget === gl.TEXTURE_2D ||
      (textureTarget >= gl.TEXTURE_CUBE_MAP_POSITIVE_X &&
        textureTarget <= gl.TEXTURE_CUBE_MAP_NEGATIVE_Z)
    ) {
      // see #24753

      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        attachment,
        textureTarget,
        this.#properties.get(texture).__webglTexture,
        level
      );
    }

    state.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  // Setup storage for internal depth/stencil buffers and bind to correct framebuffer
  #setupRenderBufferStorage(renderbuffer, renderTarget, isMultisample) {
    const gl = this.#gl;

    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);

    if (renderTarget.depthBuffer && !renderTarget.stencilBuffer) {
      let glInternalFormat; // appease type checking
      glInternalFormat = gl.DEPTH_COMPONENT32F;

      if (isMultisample) {
        const depthTexture = renderTarget.depthTexture;

        if (depthTexture && depthTexture.isDepthTexture) {
          if (depthTexture.type === FloatType) {
            glInternalFormat = gl.DEPTH_COMPONENT32F;
          } else if (depthTexture.type === UnsignedIntType) {
            glInternalFormat = gl.DEPTH_COMPONENT24;
          }
        }

        const samples = this.#getRenderTargetSamples(renderTarget);

        gl.renderbufferStorageMultisample(
          gl.RENDERBUFFER,
          samples,
          glInternalFormat,
          renderTarget.width,
          renderTarget.height
        );
      } else {
        gl.renderbufferStorage(
          gl.RENDERBUFFER,
          glInternalFormat,
          renderTarget.width,
          renderTarget.height
        );
      }

      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        renderbuffer
      );
    } else if (renderTarget.depthBuffer && renderTarget.stencilBuffer) {
      const samples = this.#getRenderTargetSamples(renderTarget);

      if (isMultisample) {
        gl.renderbufferStorageMultisample(
          gl.RENDERBUFFER,
          samples,
          gl.DEPTH24_STENCIL8,
          renderTarget.width,
          renderTarget.height
        );
      } else {
        gl.renderbufferStorage(
          gl.RENDERBUFFER,
          gl.DEPTH_STENCIL,
          renderTarget.width,
          renderTarget.height
        );
      }

      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_STENCIL_ATTACHMENT,
        gl.RENDERBUFFER,
        renderbuffer
      );
    } else {
      const textures =
        renderTarget.isWebGLMultipleRenderTargets === true ?
          renderTarget.texture
        : [renderTarget.texture];

      for (const texture of textures) {
        const glFormat = this.#utils.convert(texture.format, texture.colorSpace);
        const glType = this.#utils.convert(texture.type);
        const glInternalFormat = this.#getInternalFormat(
          texture.internalFormat,
          glFormat,
          glType,
          texture.colorSpace
        );
        const samples = this.#getRenderTargetSamples(renderTarget);

        if (isMultisample) {
          gl.renderbufferStorageMultisample(
            gl.RENDERBUFFER,
            samples,
            glInternalFormat,
            renderTarget.width,
            renderTarget.height
          );
        } else {
          gl.renderbufferStorage(
            gl.RENDERBUFFER,
            glInternalFormat,
            renderTarget.width,
            renderTarget.height
          );
        }
      }
    }

    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }

  // Setup resources for a Depth Texture for a FBO (needs an extension)
  #setupDepthTexture(framebuffer, renderTarget) {
    const gl = this.#gl;
    const properties = this.#properties;

    const isCube = renderTarget && renderTarget.isWebGLCubeRenderTarget;
    if (isCube) throw new Error('Depth Texture with cube render targets is not supported');

    this.#state.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    if (!(renderTarget.depthTexture && renderTarget.depthTexture.isDepthTexture)) {
      throw new Error('renderTarget.depthTexture must be an instance of DepthTexture');
    }

    // upload an empty depth texture with framebuffer size
    if (
      !properties.get(renderTarget.depthTexture).__webglTexture ||
      renderTarget.depthTexture.image.width !== renderTarget.width ||
      renderTarget.depthTexture.image.height !== renderTarget.height
    ) {
      renderTarget.depthTexture.image.width = renderTarget.width;
      renderTarget.depthTexture.image.height = renderTarget.height;
      renderTarget.depthTexture.needsUpdate = true;
    }

    this.setTexture2D(renderTarget.depthTexture, 0);

    const webglDepthTexture = properties.get(renderTarget.depthTexture).__webglTexture;
    const samples = this.#getRenderTargetSamples(renderTarget);

    if (renderTarget.depthTexture.format === DepthFormat) {
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.TEXTURE_2D,
        webglDepthTexture,
        0
      );
    } else if (renderTarget.depthTexture.format === DepthStencilFormat) {
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.DEPTH_STENCIL_ATTACHMENT,
        gl.TEXTURE_2D,
        webglDepthTexture,
        0
      );
    } else {
      throw new Error('Unknown depthTexture format');
    }
  }

  // Setup GL resources for a non-texture depth buffer
  setupDepthRenderbuffer(renderTarget) {
    const gl = this.#gl;
    const state = this.#state;

    const renderTargetProperties = this.#properties.get(renderTarget);
    const isCube = renderTarget.isWebGLCubeRenderTarget === true;

    if (renderTarget.depthTexture && !renderTargetProperties.__autoAllocateDepthBuffer) {
      if (isCube) throw new Error('target.depthTexture not supported in Cube render targets');

      this.#setupDepthTexture(renderTargetProperties.__webglFramebuffer, renderTarget);
    } else {
      if (isCube) {
        renderTargetProperties.__webglDepthbuffer = [];

        for (let i = 0; i < 6; i++) {
          state.bindFramebuffer(gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer[i]);
          renderTargetProperties.__webglDepthbuffer[i] = gl.createRenderbuffer();
          this.#setupRenderBufferStorage(
            renderTargetProperties.__webglDepthbuffer[i],
            renderTarget,
            false
          );
        }
      } else {
        state.bindFramebuffer(gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);
        renderTargetProperties.__webglDepthbuffer = gl.createRenderbuffer();
        this.#setupRenderBufferStorage(
          renderTargetProperties.__webglDepthbuffer,
          renderTarget,
          false
        );
      }
    }

    state.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  // rebind framebuffer with external textures
  rebindTextures(renderTarget, colorTexture, depthTexture) {
    const gl = this.#gl;

    const renderTargetProperties = this.#properties.get(renderTarget);

    if (colorTexture !== undefined) {
      this.setupFrameBufferTexture(
        renderTargetProperties.__webglFramebuffer,
        renderTarget,
        renderTarget.texture,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        0
      );
    }

    if (depthTexture !== undefined) {
      this.setupDepthRenderbuffer(renderTarget);
    }
  }

  // Set up GL resources for the render target
  setupRenderTarget(renderTarget) {
    const gl = this.#gl;
    const properties = this.#properties;
    const info = this.#info;
    const capabilities = this.#capabilities;
    const state = this.#state;
    const utils = this.#utils;

    const texture = renderTarget.texture;

    const renderTargetProperties = properties.get(renderTarget);
    const textureProperties = properties.get(texture);

    renderTarget.addEventListener('dispose', this.onRenderTargetDispose);

    if (renderTarget.isWebGLMultipleRenderTargets !== true) {
      if (textureProperties.__webglTexture === undefined) {
        textureProperties.__webglTexture = gl.createTexture();
      }

      textureProperties.__version = texture.version;
      info.memory.textures++;
    }

    const isCube = renderTarget.isWebGLCubeRenderTarget === true;
    const isMultipleRenderTargets = renderTarget.isWebGLMultipleRenderTargets === true;

    const supportsMips = true;

    // Setup framebuffer

    if (isCube) {
      renderTargetProperties.__webglFramebuffer = [];

      for (let i = 0; i < 6; i++) {
        if (texture.mipmaps && texture.mipmaps.length > 0) {
          renderTargetProperties.__webglFramebuffer[i] = [];

          for (let level = 0; level < texture.mipmaps.length; level++) {
            renderTargetProperties.__webglFramebuffer[i][level] = gl.createFramebuffer();
          }
        } else {
          renderTargetProperties.__webglFramebuffer[i] = gl.createFramebuffer();
        }
      }
    } else {
      if (texture.mipmaps && texture.mipmaps.length > 0) {
        renderTargetProperties.__webglFramebuffer = [];

        for (let level = 0; level < texture.mipmaps.length; level++) {
          renderTargetProperties.__webglFramebuffer[level] = gl.createFramebuffer();
        }
      } else {
        renderTargetProperties.__webglFramebuffer = gl.createFramebuffer();
      }

      if (isMultipleRenderTargets) {
        if (capabilities.drawBuffers) {
          const textures = renderTarget.texture;

          for (let i = 0, il = textures.length; i < il; i++) {
            const attachmentProperties = properties.get(textures[i]);

            if (attachmentProperties.__webglTexture === undefined) {
              attachmentProperties.__webglTexture = gl.createTexture();

              info.memory.textures++;
            }
          }
        } else {
          console.warn(
            'WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.'
          );
        }
      }

      if (renderTarget.samples > 0) {
        const textures = isMultipleRenderTargets ? texture : [texture];

        renderTargetProperties.__webglMultisampledFramebuffer = gl.createFramebuffer();
        renderTargetProperties.__webglColorRenderbuffer = [];

        state.bindFramebuffer(
          gl.FRAMEBUFFER,
          renderTargetProperties.__webglMultisampledFramebuffer
        );

        for (let i = 0; i < textures.length; i++) {
          const texture = textures[i];
          renderTargetProperties.__webglColorRenderbuffer[i] = gl.createRenderbuffer();

          gl.bindRenderbuffer(gl.RENDERBUFFER, renderTargetProperties.__webglColorRenderbuffer[i]);

          const glFormat = utils.convert(texture.format, texture.colorSpace);
          const glType = utils.convert(texture.type);
          const glInternalFormat = this.#getInternalFormat(
            texture.internalFormat,
            glFormat,
            glType,
            texture.colorSpace,
            renderTarget.isXRRenderTarget === true
          );
          const samples = this.#getRenderTargetSamples(renderTarget);
          gl.renderbufferStorageMultisample(
            gl.RENDERBUFFER,
            samples,
            glInternalFormat,
            renderTarget.width,
            renderTarget.height
          );

          gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0 + i,
            gl.RENDERBUFFER,
            renderTargetProperties.__webglColorRenderbuffer[i]
          );
        }

        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        if (renderTarget.depthBuffer) {
          renderTargetProperties.__webglDepthRenderbuffer = gl.createRenderbuffer();
          this.#setupRenderBufferStorage(
            renderTargetProperties.__webglDepthRenderbuffer,
            renderTarget,
            true
          );
        }

        state.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
    }

    // Setup color buffer

    if (isCube) {
      state.bindTexture(gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture);
      this.#setTextureParameters(gl.TEXTURE_CUBE_MAP, texture, supportsMips);

      for (let i = 0; i < 6; i++) {
        if (texture.mipmaps && texture.mipmaps.length > 0) {
          for (let level = 0; level < texture.mipmaps.length; level++) {
            this.setupFrameBufferTexture(
              renderTargetProperties.__webglFramebuffer[i][level],
              renderTarget,
              texture,
              gl.COLOR_ATTACHMENT0,
              gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
              level
            );
          }
        } else {
          this.setupFrameBufferTexture(
            renderTargetProperties.__webglFramebuffer[i],
            renderTarget,
            texture,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
            0
          );
        }
      }

      if (this.#textureNeedsGenerateMipmaps(texture, supportsMips)) {
        this.#generateMipmap(gl.TEXTURE_CUBE_MAP);
      }

      state.unbindTexture();
    } else if (isMultipleRenderTargets) {
      const textures = renderTarget.texture;

      for (let i = 0, il = textures.length; i < il; i++) {
        const attachment = textures[i];
        const attachmentProperties = properties.get(attachment);

        state.bindTexture(gl.TEXTURE_2D, attachmentProperties.__webglTexture);
        this.#setTextureParameters(gl.TEXTURE_2D, attachment, supportsMips);
        this.setupFrameBufferTexture(
          renderTargetProperties.__webglFramebuffer,
          renderTarget,
          attachment,
          gl.COLOR_ATTACHMENT0 + i,
          gl.TEXTURE_2D,
          0
        );

        if (this.#textureNeedsGenerateMipmaps(attachment, supportsMips)) {
          this.#generateMipmap(gl.TEXTURE_2D);
        }
      }

      state.unbindTexture();
    } else {
      let glTextureType; // appease type checking
      glTextureType = gl.TEXTURE_2D;

      if (renderTarget.isWebGL3DRenderTarget || renderTarget.isWebGLArrayRenderTarget) {
        glTextureType = renderTarget.isWebGL3DRenderTarget ? gl.TEXTURE_3D : gl.TEXTURE_2D_ARRAY;
      }

      state.bindTexture(glTextureType, textureProperties.__webglTexture);
      this.#setTextureParameters(glTextureType, texture, supportsMips);

      if (texture.mipmaps && texture.mipmaps.length > 0) {
        for (let level = 0; level < texture.mipmaps.length; level++) {
          this.setupFrameBufferTexture(
            renderTargetProperties.__webglFramebuffer[level],
            renderTarget,
            texture,
            gl.COLOR_ATTACHMENT0,
            glTextureType,
            level
          );
        }
      } else {
        this.setupFrameBufferTexture(
          renderTargetProperties.__webglFramebuffer,
          renderTarget,
          texture,
          gl.COLOR_ATTACHMENT0,
          glTextureType,
          0
        );
      }

      if (this.#textureNeedsGenerateMipmaps(texture, supportsMips)) {
        this.#generateMipmap(glTextureType);
      }

      state.unbindTexture();
    }

    // Setup depth and stencil buffers

    if (renderTarget.depthBuffer) {
      this.setupDepthRenderbuffer(renderTarget);
    }
  }

  updateRenderTargetMipmap(renderTarget) {
    const gl = this.#gl;

    const supportsMips = true;

    const textures =
      renderTarget.isWebGLMultipleRenderTargets === true ?
        renderTarget.texture
      : [renderTarget.texture];

    for (let i = 0, il = textures.length; i < il; i++) {
      const texture = textures[i];

      if (this.#textureNeedsGenerateMipmaps(texture, supportsMips)) {
        const target = renderTarget.isWebGLCubeRenderTarget ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D;
        const webglTexture = this.#properties.get(texture).__webglTexture;

        this.#state.bindTexture(target, webglTexture);
        this.#generateMipmap(target);
        this.#state.unbindTexture();
      }
    }
  }

  updateMultisampleRenderTarget(renderTarget) {
    const gl = this.#gl;
    const properties = this.#properties;
    const state = this.#state;

    if (renderTarget.samples > 0) {
      const textures =
        renderTarget.isWebGLMultipleRenderTargets ? renderTarget.texture : [renderTarget.texture];
      const width = renderTarget.width;
      const height = renderTarget.height;
      let mask = gl.COLOR_BUFFER_BIT;
      const invalidationArray = [];
      const depthStyle =
        renderTarget.stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;
      const renderTargetProperties = properties.get(renderTarget);
      const isMultipleRenderTargets = renderTarget.isWebGLMultipleRenderTargets === true;

      // If MRT we need to remove FBO attachments
      if (isMultipleRenderTargets) {
        for (let i = 0; i < textures.length; i++) {
          state.bindFramebuffer(
            gl.FRAMEBUFFER,
            renderTargetProperties.__webglMultisampledFramebuffer
          );
          gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0 + i,
            gl.RENDERBUFFER,
            null
          );

          state.bindFramebuffer(gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);
          gl.framebufferTexture2D(
            gl.DRAW_FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0 + i,
            gl.TEXTURE_2D,
            null,
            0
          );
        }
      }

      state.bindFramebuffer(
        gl.READ_FRAMEBUFFER,
        renderTargetProperties.__webglMultisampledFramebuffer
      );
      state.bindFramebuffer(gl.DRAW_FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);

      for (let i = 0; i < textures.length; i++) {
        invalidationArray.push(gl.COLOR_ATTACHMENT0 + i);

        if (renderTarget.depthBuffer) {
          invalidationArray.push(depthStyle);
        }

        const ignoreDepthValues =
          renderTargetProperties.__ignoreDepthValues !== undefined ?
            renderTargetProperties.__ignoreDepthValues
          : false;

        if (ignoreDepthValues === false) {
          if (renderTarget.depthBuffer) mask |= gl.DEPTH_BUFFER_BIT;
          if (renderTarget.stencilBuffer) mask |= gl.STENCIL_BUFFER_BIT;
        }

        if (isMultipleRenderTargets) {
          gl.framebufferRenderbuffer(
            gl.READ_FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.RENDERBUFFER,
            renderTargetProperties.__webglColorRenderbuffer[i]
          );
        }

        if (ignoreDepthValues === true) {
          gl.invalidateFramebuffer(gl.READ_FRAMEBUFFER, [depthStyle]);
          gl.invalidateFramebuffer(gl.DRAW_FRAMEBUFFER, [depthStyle]);
        }

        if (isMultipleRenderTargets) {
          const webglTexture = properties.get(textures[i]).__webglTexture;
          gl.framebufferTexture2D(
            gl.DRAW_FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            webglTexture,
            0
          );
        }

        gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height, mask, gl.NEAREST);

        if (this.#supportsInvalidateFramebuffer) {
          gl.invalidateFramebuffer(gl.READ_FRAMEBUFFER, invalidationArray);
        }
      }

      state.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
      state.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);

      // If MRT since pre-blit we removed the FBO we need to reconstruct the attachments
      if (isMultipleRenderTargets) {
        for (let i = 0; i < textures.length; i++) {
          state.bindFramebuffer(
            gl.FRAMEBUFFER,
            renderTargetProperties.__webglMultisampledFramebuffer
          );
          gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0 + i,
            gl.RENDERBUFFER,
            renderTargetProperties.__webglColorRenderbuffer[i]
          );

          const webglTexture = properties.get(textures[i]).__webglTexture;

          state.bindFramebuffer(gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);
          gl.framebufferTexture2D(
            gl.DRAW_FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0 + i,
            gl.TEXTURE_2D,
            webglTexture,
            0
          );
        }
      }

      state.bindFramebuffer(
        gl.DRAW_FRAMEBUFFER,
        renderTargetProperties.__webglMultisampledFramebuffer
      );
    }
  }

  #getRenderTargetSamples(renderTarget) {
    return Math.min(this.#maxSamples, renderTarget.samples);
  }

  #updateVideoTexture(texture) {
    const frame = this.#info.render.frame;

    // Check the last frame we updated the VideoTexture

    if (this.#videoTextures.get(texture) !== frame) {
      this.#videoTextures.set(texture, frame);
      texture.update();
    }
  }

  #verifyColorSpace(texture, image) {
    const colorSpace = texture.colorSpace;
    const format = texture.format;
    const type = texture.type;

    if (
      texture.isCompressedTexture === true ||
      texture.isVideoTexture === true ||
      texture.format === _SRGBAFormat
    )
      return image;

    if (colorSpace !== LinearSRGBColorSpace && colorSpace !== NoColorSpace) {
      // sRGB

      if (ColorManagement.getTransfer(colorSpace) === SRGBTransfer) {
        // in WebGL 2 uncompressed textures can only be sRGB encoded if they have the RGBA8 format

        if (format !== RGBAFormat || type !== UnsignedByteType) {
          console.warn(
            'WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.'
          );
        }
      } else {
        console.error('WebGLTextures: Unsupported texture color space:', colorSpace);
      }
    }

    return image;
  }
}

export { WebGLTextures };
