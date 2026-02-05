/**
 * Loader for KTX 2.0 GPU Texture containers.
 *
 * KTX 2.0 is a container format for various GPU texture formats. The loader
 * supports Basis Universal GPU textures, which can be quickly transcoded to
 * a wide variety of GPU texture compression formats, as well as some
 * uncompressed DataTexture and Data3DTexture formats.
 */

import {
  CompressedArrayTexture,
  CompressedCubeTexture,
  CompressedTexture,
  Data3DTexture,
  DataTexture
} from '@renderlayer/textures';

import { FileLoader, Loader } from '@renderlayer/loaders';

import {
  DisplayP3ColorSpace,
  FloatType,
  HalfFloatType,
  LinearDisplayP3ColorSpace,
  LinearFilter,
  LinearMipmapLinearFilter,
  LinearSRGBColorSpace,
  NearestFilter,
  NearestMipmapNearestFilter,
  NoColorSpace,
  R11_EAC_Format,
  RED_GREEN_RGTC2_Format,
  RED_RGTC1_Format,
  RG11_EAC_Format,
  RGBAFormat,
  RGBA_ASTC_4x4_Format,
  RGBA_ASTC_6x6_Format,
  RGBA_BPTC_Format,
  RGBA_ETC2_EAC_Format,
  RGBA_PVRTC_2BPPV1_Format,
  RGBA_PVRTC_4BPPV1_Format,
  RGBA_S3TC_DXT1_Format,
  RGBA_S3TC_DXT5_Format,
  RGBFormat,
  RGB_BPTC_UNSIGNED_Format,
  RGB_ETC1_Format,
  RGB_ETC2_Format,
  RGB_PVRTC_4BPPV1_Format,
  RGB_S3TC_DXT1_Format,
  RGFormat,
  RedFormat,
  SIGNED_R11_EAC_Format,
  SIGNED_RED_GREEN_RGTC2_Format,
  SIGNED_RED_RGTC1_Format,
  SIGNED_RG11_EAC_Format,
  SRGBColorSpace,
  UnsignedByteType,
  UnsignedInt101111Type,
  UnsignedInt5999Type,
  WorkerPool
} from '@renderlayer/shared';

import {
  KHR_DF_FLAG_ALPHA_PREMULTIPLIED,
  KHR_DF_PRIMARIES_BT709,
  KHR_DF_PRIMARIES_DISPLAYP3,
  KHR_DF_PRIMARIES_UNSPECIFIED,
  KHR_DF_TRANSFER_SRGB,
  KHR_SUPERCOMPRESSION_NONE,
  KHR_SUPERCOMPRESSION_ZSTD,
  VK_FORMAT_ASTC_4x4_SFLOAT_BLOCK_EXT,
  VK_FORMAT_ASTC_4x4_SRGB_BLOCK,
  VK_FORMAT_ASTC_4x4_UNORM_BLOCK,
  VK_FORMAT_ASTC_6x6_SFLOAT_BLOCK_EXT,
  VK_FORMAT_ASTC_6x6_SRGB_BLOCK,
  VK_FORMAT_ASTC_6x6_UNORM_BLOCK,
  VK_FORMAT_B10G11R11_UFLOAT_PACK32,
  VK_FORMAT_BC1_RGBA_SRGB_BLOCK,
  VK_FORMAT_BC1_RGBA_UNORM_BLOCK,
  VK_FORMAT_BC1_RGB_SRGB_BLOCK,
  VK_FORMAT_BC1_RGB_UNORM_BLOCK,
  VK_FORMAT_BC3_SRGB_BLOCK,
  VK_FORMAT_BC3_UNORM_BLOCK,
  VK_FORMAT_BC4_SNORM_BLOCK,
  VK_FORMAT_BC4_UNORM_BLOCK,
  VK_FORMAT_BC5_SNORM_BLOCK,
  VK_FORMAT_BC5_UNORM_BLOCK,
  VK_FORMAT_BC7_SRGB_BLOCK,
  VK_FORMAT_BC7_UNORM_BLOCK,
  VK_FORMAT_E5B9G9R9_UFLOAT_PACK32,
  VK_FORMAT_EAC_R11G11_SNORM_BLOCK,
  VK_FORMAT_EAC_R11G11_UNORM_BLOCK,
  VK_FORMAT_EAC_R11_SNORM_BLOCK,
  VK_FORMAT_EAC_R11_UNORM_BLOCK,
  VK_FORMAT_ETC2_R8G8B8A8_SRGB_BLOCK,
  VK_FORMAT_ETC2_R8G8B8_SRGB_BLOCK,
  VK_FORMAT_PVRTC1_2BPP_SRGB_BLOCK_IMG,
  VK_FORMAT_PVRTC1_2BPP_UNORM_BLOCK_IMG,
  VK_FORMAT_PVRTC1_4BPP_SRGB_BLOCK_IMG,
  VK_FORMAT_PVRTC1_4BPP_UNORM_BLOCK_IMG,
  VK_FORMAT_R16G16B16A16_SFLOAT,
  VK_FORMAT_R16G16_SFLOAT,
  VK_FORMAT_R16_SFLOAT,
  VK_FORMAT_R32G32B32A32_SFLOAT,
  VK_FORMAT_R32G32_SFLOAT,
  VK_FORMAT_R32_SFLOAT,
  VK_FORMAT_R8G8B8A8_SRGB,
  VK_FORMAT_R8G8B8A8_UNORM,
  VK_FORMAT_R8G8_SRGB,
  VK_FORMAT_R8G8_UNORM,
  VK_FORMAT_R8_SRGB,
  VK_FORMAT_R8_UNORM,
  VK_FORMAT_UNDEFINED,
  read
} from 'ktx-parse';

import { ZSTDDecoder } from 'zstddec';

let _zstd;

class KTX2Loader extends Loader {
  transcoderPath = '';
  #transcoderBinary = null;
  #transcoderPending = null;

  #workerPool = new WorkerPool();
  #workerSourceURL = '';
  #workerConfig = null;

  constructor(manager) {
    super(manager);
  }

  get supportedFormats() {
    if (this.#workerConfig === null) {
      throw new Error('KTX2Loader: Missing initialization with `.detectSupport( renderer )`.');
    }

    return this.#workerConfig;
  }

  dispose() {
    this.#workerPool.dispose();
    if (this.#workerSourceURL) URL.revokeObjectURL(this.#workerSourceURL);

    _activeLoaders--;
  }

  setTranscoderPath(path) {
    this.transcoderPath = path;

    return this;
  }

  setWorkerLimit(num) {
    this.#workerPool.setWorkerLimit(num);

    return this;
  }

  detectSupport(renderer) {
    if (renderer.isWebGPURenderer === true) {
      this.#workerConfig = {
        astcSupported: renderer.hasFeature('texture-compression-astc'),
        astcHDRSupported: false, // https://github.com/gpuweb/gpuweb/issues/3856
        etc1Supported: false, // support provided by etc2
        etc2Supported: renderer.hasFeature('texture-compression-etc2'),
        dxtSupported: false, // rgb565 smooth and hard alpha provided by bc (bptc)
        rgtcSupported: false, // 1 and 2 channel textures provided by bc (bptc)
        bptcSupported: renderer.hasFeature('texture-compression-bc'),
        pvrtcSupported: renderer.hasFeature('texture-compression-pvrtc')
      };
    } else {
      this.#workerConfig = {
        astcSupported: renderer.extensions.has('WEBGL_compressed_texture_astc'),
        astcHDRSupported:
          renderer.extensions.has('WEBGL_compressed_texture_astc') &&
          renderer.extensions
            .get('WEBGL_compressed_texture_astc')
            .getSupportedProfiles()
            .includes('hdr'),
        etc1Supported: renderer.extensions.has('WEBGL_compressed_texture_etc1'),
        etc2Supported: renderer.extensions.has('WEBGL_compressed_texture_etc'),
        dxtSupported: renderer.extensions.has('WEBGL_compressed_texture_s3tc'),
        rgtcSupported: renderer.extensions.has('EXT_texture_compression_rgtc'),
        bptcSupported: renderer.extensions.has('EXT_texture_compression_bptc'),
        pvrtcSupported:
          renderer.extensions.has('WEBGL_compressed_texture_pvrtc') ||
          renderer.extensions.has('WEBKIT_WEBGL_compressed_texture_pvrtc')
      };

      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.platform !== 'undefined' &&
        typeof navigator.userAgent !== 'undefined' &&
        navigator.platform.indexOf('Linux') >= 0 &&
        navigator.userAgent.indexOf('Firefox') >= 0 &&
        this.#workerConfig.astcSupported &&
        this.#workerConfig.etc2Supported &&
        this.#workerConfig.bptcSupported &&
        this.#workerConfig.dxtSupported
      ) {
        // On Linux, Mesa drivers for AMD and Intel GPUs expose ETC2 and ASTC even though the hardware doesn't support these.
        // Using these extensions will result in expensive software decompression on the main thread inside the driver, causing performance issues.
        // When using ANGLE (e.g. via Chrome), these extensions are not exposed except for some specific Intel GPU models - however, Firefox doesn't perform this filtering.
        // Since a granular filter is a little too fragile and we can transcode into other GPU formats, disable formats that are likely to be emulated.

        this.#workerConfig.astcSupported = false;
        this.#workerConfig.etc2Supported = false;
      }
    }

    return this;
  }

  #initTranscoder() {
    if (this.#transcoderPending) return this.#transcoderPending;

    // Load transcoder wrapper.
    const jsLoader = new FileLoader(this.manager);
    jsLoader.setPath(this.transcoderPath);
    jsLoader.setWithCredentials(this.withCredentials);
    const jsContent = jsLoader.loadAsync('basis_transcoder.js');

    // Load transcoder WASM binary.
    const binaryLoader = new FileLoader(this.manager);
    binaryLoader.setPath(this.transcoderPath);
    binaryLoader.setResponseType('arraybuffer');
    binaryLoader.setWithCredentials(this.withCredentials);
    const binaryContent = binaryLoader.loadAsync('basis_transcoder.wasm');

    this.#transcoderPending = Promise.all([jsContent, binaryContent]).then(
      ([jsContent, binaryContent]) => {
        const fn = KTX2Loader.BasisWorker.toString();

        const body = [
          '/* constants */',
          'let _EngineFormat = ' + JSON.stringify(KTX2Loader.EngineFormat),
          'let _EngineType = ' + JSON.stringify(KTX2Loader.EngineType),
          'let _TranscoderFormat = ' + JSON.stringify(KTX2Loader.TranscoderFormat),
          'let _BasisFormat = ' + JSON.stringify(KTX2Loader.BasisFormat),
          '/* basis_transcoder.js */',
          jsContent,
          '/* worker */',
          fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}'))
        ].join('\n');

        this.#workerSourceURL = URL.createObjectURL(new Blob([body]));
        this.#transcoderBinary = binaryContent;

        this.#workerPool.setWorkerCreator(() => {
          const worker = new Worker(this.#workerSourceURL);
          const transcoderBinary = this.#transcoderBinary.slice(0);

          worker.postMessage({ type: 'init', config: this.#workerConfig, transcoderBinary }, [
            transcoderBinary
          ]);

          return worker;
        });
      }
    );

    if (_activeLoaders > 0) {
      // Each instance loads a transcoder and allocates workers, increasing network and memory cost.

      console.warn(
        'KTX2Loader: Multiple active KTX2 loaders may cause performance issues.' +
          ' Use a single KTX2Loader instance, or call .dispose() on old instances.'
      );
    }

    _activeLoaders++;

    return this.#transcoderPending;
  }

  load(url, onLoad, onProgress, onError) {
    if (this.#workerConfig === null) {
      throw new Error('KTX2Loader: Missing initialization with `.detectSupport( renderer )`.');
    }

    const loader = new FileLoader(this.manager);

    loader.setPath(this.path);
    loader.setCrossOrigin(this.crossOrigin);
    loader.setWithCredentials(this.withCredentials);
    loader.setRequestHeader(this.requestHeader);
    loader.setResponseType('arraybuffer');

    loader.load(
      url,
      (buffer) => {
        this.parse(buffer, onLoad, onError);
      },
      onProgress,
      onError
    );
  }

  parse(buffer, onLoad, onError) {
    if (this.#workerConfig === null) {
      throw new Error('KTX2Loader: Missing initialization with `.detectSupport( renderer )`.');
    }

    // Check for an existing task using this buffer. A transferred buffer cannot be transferred
    // again from this thread.
    if (_taskCache.has(buffer)) {
      const cachedTask = _taskCache.get(buffer);

      return cachedTask.promise.then(onLoad).catch(onError);
    }

    this.#createTexture(buffer)
      .then((texture) => (onLoad ? onLoad(texture) : null))
      .catch(onError);
  }

  #createTextureFrom(transcodeResult, container) {
    const {
      type: messageType,
      error,
      data: { faces, width, height, format, type, dfdFlags }
    } = transcodeResult;

    if (messageType === 'error') return Promise.reject(error);

    let texture;

    if (container.faceCount === 6) {
      texture = new CompressedCubeTexture(faces, format, type);
    } else {
      const mipmaps = faces[0].mipmaps;

      texture =
        container.layerCount > 1 ?
          new CompressedArrayTexture(mipmaps, width, height, container.layerCount, format, type)
        : new CompressedTexture(mipmaps, width, height, format, type);
    }

    texture.minFilter = faces[0].mipmaps.length === 1 ? LinearFilter : LinearMipmapLinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;

    texture.needsUpdate = true;
    texture.colorSpace = _parseColorSpace(container);
    texture.premultiplyAlpha = !!(dfdFlags & KHR_DF_FLAG_ALPHA_PREMULTIPLIED);

    return texture;
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {object?} config
   * @return {Promise<CompressedTexture|CompressedArrayTexture|DataTexture|Data3DTexture>}
   */
  async #createTexture(buffer, config = {}) {
    const container = read(new Uint8Array(buffer));

    // Basis UASTC HDR is a subset of ASTC, which can be transcoded efficiently
    // to BC6H. To detect whether a KTX2 file uses Basis UASTC HDR, or default
    // ASTC, inspect the DFD color model.
    //
    // Source: https://github.com/BinomialLLC/basis_universal/issues/381
    const isBasisHDR =
      container.vkFormat === VK_FORMAT_ASTC_4x4_SFLOAT_BLOCK_EXT &&
      container.dataFormatDescriptor[0].colorModel === 0xa7;

    // If the device supports ASTC, Basis UASTC HDR requires no transcoder.
    const needsTranscoder =
      container.vkFormat === VK_FORMAT_UNDEFINED ||
      (isBasisHDR && !this.#workerConfig.astcHDRSupported);

    if (!needsTranscoder) {
      return _createRawTexture(container);
    }

    //
    const taskConfig = config;
    const texturePending = this.#initTranscoder()
      .then(() => {
        return this.#workerPool.postMessage({ type: 'transcode', buffer, taskConfig: taskConfig }, [
          buffer
        ]);
      })
      .then((e) => this.#createTextureFrom(e.data, container));

    // Cache the task result.
    _taskCache.set(buffer, { promise: texturePending });

    return texturePending;
  }
}

/* CONSTANTS */

KTX2Loader.BasisFormat = {
  ETC1S: 0,
  UASTC: 1,
  UASTC_HDR: 2
};

// Source: https://github.com/BinomialLLC/basis_universal/blob/master/webgl/texture_test/index.html
KTX2Loader.TranscoderFormat = {
  ETC1: 0,
  ETC2: 1,
  BC1: 2,
  BC3: 3,
  BC4: 4,
  BC5: 5,
  BC7_M6_OPAQUE_ONLY: 6,
  BC7_M5: 7,
  PVRTC1_4_RGB: 8,
  PVRTC1_4_RGBA: 9,
  ASTC_4x4: 10,
  ATC_RGB: 11,
  ATC_RGBA_INTERPOLATED_ALPHA: 12,
  RGBA32: 13,
  RGB565: 14,
  BGR565: 15,
  RGBA4444: 16,
  BC6H: 22,
  RGB_HALF: 24,
  RGBA_HALF: 25
};

KTX2Loader.EngineFormat = {
  RGBAFormat: RGBAFormat,
  RGBA_ASTC_4x4_Format: RGBA_ASTC_4x4_Format,
  RGB_BPTC_UNSIGNED_Format: RGB_BPTC_UNSIGNED_Format,
  RGBA_BPTC_Format: RGBA_BPTC_Format,
  RGBA_ETC2_EAC_Format: RGBA_ETC2_EAC_Format,
  RGBA_PVRTC_4BPPV1_Format: RGBA_PVRTC_4BPPV1_Format,
  RGBA_S3TC_DXT5_Format: RGBA_S3TC_DXT5_Format,
  RGB_ETC1_Format: RGB_ETC1_Format,
  RGB_ETC2_Format: RGB_ETC2_Format,
  RGB_PVRTC_4BPPV1_Format: RGB_PVRTC_4BPPV1_Format,
  RGBA_S3TC_DXT1_Format: RGBA_S3TC_DXT1_Format
};

KTX2Loader.EngineType = {
  UnsignedByteType: UnsignedByteType,
  HalfFloatType: HalfFloatType,
  FloatType: FloatType
};

/* WEB WORKER */

KTX2Loader.BasisWorker = function () {
  let config;
  let transcoderPending;
  let BasisModule;

  const EngineFormat = _EngineFormat; // eslint-disable-line no-undef
  const EngineType = _EngineType; // eslint-disable-line no-undef
  const TranscoderFormat = _TranscoderFormat; // eslint-disable-line no-undef
  const BasisFormat = _BasisFormat; // eslint-disable-line no-undef

  self.addEventListener('message', function (e) {
    const message = e.data;

    switch (message.type) {
      case 'init':
        config = message.config;
        init(message.transcoderBinary);
        break;

      case 'transcode':
        transcoderPending.then(() => {
          try {
            const { faces, buffers, width, height, hasAlpha, format, type, dfdFlags } = transcode(
              message.buffer
            );

            self.postMessage(
              {
                type: 'transcode',
                id: message.id,
                data: { faces, width, height, hasAlpha, format, type, dfdFlags }
              },
              buffers
            );
          } catch (error) {
            console.error(error);

            self.postMessage({ type: 'error', id: message.id, error: error.message });
          }
        });
        break;
    }
  });

  function init(wasmBinary) {
    transcoderPending = new Promise((resolve) => {
      BasisModule = { wasmBinary, onRuntimeInitialized: resolve };
      BASIS(BasisModule); // eslint-disable-line no-undef
    }).then(() => {
      BasisModule.initializeBasis();

      if (BasisModule.KTX2File === undefined) {
        console.warn('KTX2Loader: Please update Basis Universal transcoder.');
      }
    });
  }

  function transcode(buffer) {
    const ktx2File = new BasisModule.KTX2File(new Uint8Array(buffer));

    function cleanup() {
      ktx2File.close();
      ktx2File.delete();
    }

    if (!ktx2File.isValid()) {
      cleanup();
      throw new Error('KTX2Loader:	Invalid or unsupported .ktx2 file');
    }

    let basisFormat;

    if (ktx2File.isUASTC()) {
      basisFormat = BasisFormat.UASTC;
    } else if (ktx2File.isETC1S()) {
      basisFormat = BasisFormat.ETC1S;
    } else if (ktx2File.isHDR()) {
      basisFormat = BasisFormat.UASTC_HDR;
    } else {
      throw new Error('KTX2Loader: Unknown Basis encoding');
    }

    const width = ktx2File.getWidth();
    const height = ktx2File.getHeight();
    const layerCount = ktx2File.getLayers() || 1;
    const levelCount = ktx2File.getLevels();
    const faceCount = ktx2File.getFaces();
    const hasAlpha = ktx2File.getHasAlpha();
    const dfdFlags = ktx2File.getDFDFlags();

    const { transcoderFormat, engineFormat, engineType } = getTranscoderFormat(
      basisFormat,
      width,
      height,
      hasAlpha
    );

    if (!width || !height || !levelCount) {
      cleanup();
      throw new Error('KTX2Loader:	Invalid texture');
    }

    if (!ktx2File.startTranscoding()) {
      cleanup();
      throw new Error('KTX2Loader: .startTranscoding failed');
    }

    const faces = [];
    const buffers = [];

    for (let face = 0; face < faceCount; face++) {
      const mipmaps = [];

      for (let mip = 0; mip < levelCount; mip++) {
        const layerMips = [];

        let mipWidth, mipHeight;

        for (let layer = 0; layer < layerCount; layer++) {
          const levelInfo = ktx2File.getImageLevelInfo(mip, layer, face);

          if (
            face === 0 &&
            mip === 0 &&
            layer === 0 &&
            (levelInfo.origWidth % 4 !== 0 || levelInfo.origHeight % 4 !== 0)
          ) {
            console.warn(
              'KTX2Loader: ETC1S and UASTC textures should use multiple-of-four dimensions.'
            );
          }

          if (levelCount > 1) {
            mipWidth = levelInfo.origWidth;
            mipHeight = levelInfo.origHeight;
          } else {
            // Handles non-multiple-of-four dimensions in textures without mipmaps. Textures with
            // mipmaps must use multiple-of-four dimensions, for some texture formats and APIs.
            // See mrdoob/three.js#25908.
            mipWidth = levelInfo.width;
            mipHeight = levelInfo.height;
          }
          let dst;
          dst = new Uint8Array(
            ktx2File.getImageTranscodedSizeInBytes(mip, layer, 0, transcoderFormat)
          );
          const status = ktx2File.transcodeImage(
            dst,
            mip,
            layer,
            face,
            transcoderFormat,
            0,
            -1,
            -1
          );

          if (engineType === EngineType.HalfFloatType) {
            dst = new Uint16Array(
              dst.buffer,
              dst.byteOffset,
              dst.byteLength / Uint16Array.BYTES_PER_ELEMENT
            );
          }

          if (!status) {
            cleanup();
            throw new Error('KTX2Loader: .transcodeImage failed.');
          }

          layerMips.push(dst);
        }

        const mipData = concat(layerMips);

        mipmaps.push({ data: mipData, width: mipWidth, height: mipHeight });
        buffers.push(mipData.buffer);
      }

      faces.push({ mipmaps, width, height, format: engineFormat, type: engineType });
    }

    cleanup();

    return {
      faces,
      buffers,
      width,
      height,
      hasAlpha,
      dfdFlags,
      format: engineFormat,
      type: engineType
    };
  }

  //

  // Optimal choice of a transcoder target format depends on the Basis format (ETC1S, UASTC, or
  // UASTC HDR), device capabilities, and texture dimensions. The list below ranks the formats
  // separately for each format. Currently, priority is assigned based on:
  //
  //   high quality > low quality > uncompressed
  //
  // Prioritization may be revisited, or exposed for configuration, in the future.
  //
  // Reference: https://github.com/KhronosGroup/3D-Formats-Guidelines/blob/main/KTXDeveloperGuide.md
  const FORMAT_OPTIONS = [
    {
      if: 'astcSupported',
      basisFormat: [BasisFormat.UASTC],
      transcoderFormat: [TranscoderFormat.ASTC_4x4, TranscoderFormat.ASTC_4x4],
      engineFormat: [EngineFormat.RGBA_ASTC_4x4_Format, EngineFormat.RGBA_ASTC_4x4_Format],
      engineType: [EngineType.UnsignedByteType],
      priorityETC1S: Infinity,
      priorityUASTC: 1,
      needsPowerOfTwo: false
    },
    {
      if: 'bptcSupported',
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC],
      transcoderFormat: [TranscoderFormat.BC7_M5, TranscoderFormat.BC7_M5],
      engineFormat: [EngineFormat.RGBA_BPTC_Format, EngineFormat.RGBA_BPTC_Format],
      engineType: [EngineType.UnsignedByteType],
      priorityETC1S: 3,
      priorityUASTC: 2,
      needsPowerOfTwo: false
    },
    {
      if: 'dxtSupported',
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC],
      transcoderFormat: [TranscoderFormat.BC1, TranscoderFormat.BC3],
      engineFormat: [EngineFormat.RGBA_S3TC_DXT1_Format, EngineFormat.RGBA_S3TC_DXT5_Format],
      engineType: [EngineType.UnsignedByteType],
      priorityETC1S: 4,
      priorityUASTC: 5,
      needsPowerOfTwo: false
    },
    {
      if: 'etc2Supported',
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC],
      transcoderFormat: [TranscoderFormat.ETC1, TranscoderFormat.ETC2],
      engineFormat: [EngineFormat.RGB_ETC2_Format, EngineFormat.RGBA_ETC2_EAC_Format],
      engineType: [EngineType.UnsignedByteType],
      priorityETC1S: 1,
      priorityUASTC: 3,
      needsPowerOfTwo: false
    },
    {
      if: 'etc1Supported',
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC],
      transcoderFormat: [TranscoderFormat.ETC1],
      engineFormat: [EngineFormat.RGB_ETC1_Format],
      engineType: [EngineType.UnsignedByteType],
      priorityETC1S: 2,
      priorityUASTC: 4,
      needsPowerOfTwo: false
    },
    {
      if: 'pvrtcSupported',
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC],
      transcoderFormat: [TranscoderFormat.PVRTC1_4_RGB, TranscoderFormat.PVRTC1_4_RGBA],
      engineFormat: [EngineFormat.RGB_PVRTC_4BPPV1_Format, EngineFormat.RGBA_PVRTC_4BPPV1_Format],
      engineType: [EngineType.UnsignedByteType],
      priorityETC1S: 5,
      priorityUASTC: 6,
      needsPowerOfTwo: true
    },
    {
      if: 'bptcSupported',
      basisFormat: [BasisFormat.UASTC_HDR],
      transcoderFormat: [TranscoderFormat.BC6H],
      engineFormat: [EngineFormat.RGB_BPTC_UNSIGNED_Format],
      engineType: [EngineType.HalfFloatType],
      priorityHDR: 1,
      needsPowerOfTwo: false
    },

    // Uncompressed fallbacks.

    {
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC],
      transcoderFormat: [TranscoderFormat.RGBA32, TranscoderFormat.RGBA32],
      engineFormat: [EngineFormat.RGBAFormat, EngineFormat.RGBAFormat],
      engineType: [EngineType.UnsignedByteType, EngineType.UnsignedByteType],
      priorityETC1S: 100,
      priorityUASTC: 100,
      needsPowerOfTwo: false
    },
    {
      basisFormat: [BasisFormat.UASTC_HDR],
      transcoderFormat: [TranscoderFormat.RGBA_HALF],
      engineFormat: [EngineFormat.RGBAFormat],
      engineType: [EngineType.HalfFloatType],
      priorityHDR: 100,
      needsPowerOfTwo: false
    }
  ];

  const OPTIONS = {
    [BasisFormat.ETC1S]: FORMAT_OPTIONS.filter((opt) =>
      opt.basisFormat.includes(BasisFormat.ETC1S)
    ).sort((a, b) => a.priorityETC1S - b.priorityETC1S),

    [BasisFormat.UASTC]: FORMAT_OPTIONS.filter((opt) =>
      opt.basisFormat.includes(BasisFormat.UASTC)
    ).sort((a, b) => a.priorityUASTC - b.priorityUASTC),

    [BasisFormat.UASTC_HDR]: FORMAT_OPTIONS.filter((opt) =>
      opt.basisFormat.includes(BasisFormat.UASTC_HDR)
    ).sort((a, b) => a.priorityHDR - b.priorityHDR)
  };

  function getTranscoderFormat(basisFormat, width, height, hasAlpha) {
    const options = OPTIONS[basisFormat];

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];

      if (opt.if && !config[opt.if]) continue;
      if (!opt.basisFormat.includes(basisFormat)) continue;
      if (hasAlpha && opt.transcoderFormat.length < 2) continue;
      if (opt.needsPowerOfTwo && !(isPowerOfTwo(width) && isPowerOfTwo(height))) continue;

      const transcoderFormat = opt.transcoderFormat[hasAlpha ? 1 : 0];
      const engineFormat = opt.engineFormat[hasAlpha ? 1 : 0];
      const engineType = opt.engineType[0];

      return { transcoderFormat, engineFormat, engineType };
    }

    throw new Error('KTX2Loader: Failed to identify transcoding target.');
  }

  function isPowerOfTwo(value) {
    if (value <= 2) return true;

    return (value & (value - 1)) === 0 && value !== 0;
  }

  /**
   * Concatenates N byte arrays.
   *
   * @param {Uint8Array[]} arrays
   * @return {Uint8Array}
   */
  function concat(arrays) {
    if (arrays.length === 1) return arrays[0];

    let totalByteLength = 0;

    for (let i = 0; i < arrays.length; i++) {
      const array = arrays[i];
      totalByteLength += array.byteLength;
    }

    const result = new Uint8Array(totalByteLength);

    let byteOffset = 0;

    for (let i = 0; i < arrays.length; i++) {
      const array = arrays[i];
      result.set(array, byteOffset);

      byteOffset += array.byteLength;
    }

    return result;
  }
};

//
// Parsing for non-Basis textures. These textures are may have supercompression
// like Zstd, but they do not require transcoding.

const UNCOMPRESSED_FORMATS = new Set([RGBAFormat, RGBFormat, RGFormat, RedFormat]);

const FORMAT_MAP = {
  [VK_FORMAT_R32G32B32A32_SFLOAT]: RGBAFormat,
  [VK_FORMAT_R32G32_SFLOAT]: RGFormat,
  [VK_FORMAT_R32_SFLOAT]: RedFormat,

  [VK_FORMAT_R16G16B16A16_SFLOAT]: RGBAFormat,
  [VK_FORMAT_R16G16_SFLOAT]: RGFormat,
  [VK_FORMAT_R16_SFLOAT]: RedFormat,

  [VK_FORMAT_R8G8B8A8_SRGB]: RGBAFormat,
  [VK_FORMAT_R8G8B8A8_UNORM]: RGBAFormat,
  [VK_FORMAT_R8G8_SRGB]: RGFormat,
  [VK_FORMAT_R8G8_UNORM]: RGFormat,
  [VK_FORMAT_R8_SRGB]: RedFormat,
  [VK_FORMAT_R8_UNORM]: RedFormat,

  [VK_FORMAT_E5B9G9R9_UFLOAT_PACK32]: RGBFormat,
  [VK_FORMAT_B10G11R11_UFLOAT_PACK32]: RGBFormat,

  [VK_FORMAT_ETC2_R8G8B8A8_SRGB_BLOCK]: RGBA_ETC2_EAC_Format,
  [VK_FORMAT_ETC2_R8G8B8_SRGB_BLOCK]: RGB_ETC2_Format,
  [VK_FORMAT_EAC_R11_UNORM_BLOCK]: R11_EAC_Format,
  [VK_FORMAT_EAC_R11_SNORM_BLOCK]: SIGNED_R11_EAC_Format,
  [VK_FORMAT_EAC_R11G11_UNORM_BLOCK]: RG11_EAC_Format,
  [VK_FORMAT_EAC_R11G11_SNORM_BLOCK]: SIGNED_RG11_EAC_Format,

  [VK_FORMAT_ASTC_4x4_SFLOAT_BLOCK_EXT]: RGBA_ASTC_4x4_Format,
  [VK_FORMAT_ASTC_4x4_SRGB_BLOCK]: RGBA_ASTC_4x4_Format,
  [VK_FORMAT_ASTC_4x4_UNORM_BLOCK]: RGBA_ASTC_4x4_Format,
  [VK_FORMAT_ASTC_6x6_SFLOAT_BLOCK_EXT]: RGBA_ASTC_6x6_Format,
  [VK_FORMAT_ASTC_6x6_SRGB_BLOCK]: RGBA_ASTC_6x6_Format,
  [VK_FORMAT_ASTC_6x6_UNORM_BLOCK]: RGBA_ASTC_6x6_Format,

  [VK_FORMAT_BC1_RGBA_SRGB_BLOCK]: RGBA_S3TC_DXT1_Format,
  [VK_FORMAT_BC1_RGBA_UNORM_BLOCK]: RGBA_S3TC_DXT1_Format,
  [VK_FORMAT_BC1_RGB_SRGB_BLOCK]: RGB_S3TC_DXT1_Format,
  [VK_FORMAT_BC1_RGB_UNORM_BLOCK]: RGB_S3TC_DXT1_Format,

  [VK_FORMAT_BC3_SRGB_BLOCK]: RGBA_S3TC_DXT5_Format,
  [VK_FORMAT_BC3_UNORM_BLOCK]: RGBA_S3TC_DXT5_Format,

  [VK_FORMAT_BC4_SNORM_BLOCK]: SIGNED_RED_RGTC1_Format,
  [VK_FORMAT_BC4_UNORM_BLOCK]: RED_RGTC1_Format,

  [VK_FORMAT_BC5_SNORM_BLOCK]: SIGNED_RED_GREEN_RGTC2_Format,
  [VK_FORMAT_BC5_UNORM_BLOCK]: RED_GREEN_RGTC2_Format,

  [VK_FORMAT_BC7_SRGB_BLOCK]: RGBA_BPTC_Format,
  [VK_FORMAT_BC7_UNORM_BLOCK]: RGBA_BPTC_Format,

  [VK_FORMAT_PVRTC1_4BPP_SRGB_BLOCK_IMG]: RGBA_PVRTC_4BPPV1_Format,
  [VK_FORMAT_PVRTC1_4BPP_UNORM_BLOCK_IMG]: RGBA_PVRTC_4BPPV1_Format,
  [VK_FORMAT_PVRTC1_2BPP_SRGB_BLOCK_IMG]: RGBA_PVRTC_2BPPV1_Format,
  [VK_FORMAT_PVRTC1_2BPP_UNORM_BLOCK_IMG]: RGBA_PVRTC_2BPPV1_Format
};

const TYPE_MAP = {
  [VK_FORMAT_R32G32B32A32_SFLOAT]: FloatType,
  [VK_FORMAT_R32G32_SFLOAT]: FloatType,
  [VK_FORMAT_R32_SFLOAT]: FloatType,

  [VK_FORMAT_R16G16B16A16_SFLOAT]: HalfFloatType,
  [VK_FORMAT_R16G16_SFLOAT]: HalfFloatType,
  [VK_FORMAT_R16_SFLOAT]: HalfFloatType,

  [VK_FORMAT_R8G8B8A8_SRGB]: UnsignedByteType,
  [VK_FORMAT_R8G8B8A8_UNORM]: UnsignedByteType,
  [VK_FORMAT_R8G8_SRGB]: UnsignedByteType,
  [VK_FORMAT_R8G8_UNORM]: UnsignedByteType,
  [VK_FORMAT_R8_SRGB]: UnsignedByteType,
  [VK_FORMAT_R8_UNORM]: UnsignedByteType,

  [VK_FORMAT_E5B9G9R9_UFLOAT_PACK32]: UnsignedInt5999Type,
  [VK_FORMAT_B10G11R11_UFLOAT_PACK32]: UnsignedInt101111Type,

  [VK_FORMAT_ETC2_R8G8B8A8_SRGB_BLOCK]: UnsignedByteType,
  [VK_FORMAT_ETC2_R8G8B8_SRGB_BLOCK]: UnsignedByteType,
  [VK_FORMAT_EAC_R11_UNORM_BLOCK]: UnsignedByteType,
  [VK_FORMAT_EAC_R11_SNORM_BLOCK]: UnsignedByteType,
  [VK_FORMAT_EAC_R11G11_UNORM_BLOCK]: UnsignedByteType,
  [VK_FORMAT_EAC_R11G11_SNORM_BLOCK]: UnsignedByteType,

  [VK_FORMAT_ASTC_4x4_SFLOAT_BLOCK_EXT]: HalfFloatType,
  [VK_FORMAT_ASTC_4x4_SRGB_BLOCK]: UnsignedByteType,
  [VK_FORMAT_ASTC_4x4_UNORM_BLOCK]: UnsignedByteType,
  [VK_FORMAT_ASTC_6x6_SFLOAT_BLOCK_EXT]: HalfFloatType,
  [VK_FORMAT_ASTC_6x6_SRGB_BLOCK]: UnsignedByteType,
  [VK_FORMAT_ASTC_6x6_UNORM_BLOCK]: UnsignedByteType,

  [VK_FORMAT_BC1_RGBA_SRGB_BLOCK]: UnsignedByteType,
  [VK_FORMAT_BC1_RGBA_UNORM_BLOCK]: UnsignedByteType,
  [VK_FORMAT_BC1_RGB_SRGB_BLOCK]: UnsignedByteType,
  [VK_FORMAT_BC1_RGB_UNORM_BLOCK]: UnsignedByteType,

  [VK_FORMAT_BC3_SRGB_BLOCK]: UnsignedByteType,
  [VK_FORMAT_BC3_UNORM_BLOCK]: UnsignedByteType,

  [VK_FORMAT_BC4_SNORM_BLOCK]: UnsignedByteType,
  [VK_FORMAT_BC4_UNORM_BLOCK]: UnsignedByteType,

  [VK_FORMAT_BC5_SNORM_BLOCK]: UnsignedByteType,
  [VK_FORMAT_BC5_UNORM_BLOCK]: UnsignedByteType,

  [VK_FORMAT_BC7_SRGB_BLOCK]: UnsignedByteType,
  [VK_FORMAT_BC7_UNORM_BLOCK]: UnsignedByteType,

  [VK_FORMAT_PVRTC1_4BPP_SRGB_BLOCK_IMG]: UnsignedByteType,
  [VK_FORMAT_PVRTC1_4BPP_UNORM_BLOCK_IMG]: UnsignedByteType,
  [VK_FORMAT_PVRTC1_2BPP_SRGB_BLOCK_IMG]: UnsignedByteType,
  [VK_FORMAT_PVRTC1_2BPP_UNORM_BLOCK_IMG]: UnsignedByteType
};

async function _createRawTexture(container) {
  const { vkFormat } = container;

  if (FORMAT_MAP[vkFormat] === undefined) {
    throw new Error('KTX2Loader: Unsupported vkFormat: ' + vkFormat);
  }

  // TODO: Merge the TYPE_MAP warning into the thrown error above, after r190.
  if (TYPE_MAP[vkFormat] === undefined) {
    console.warn('KTX2Loader: Missing ".type" for vkFormat: ' + vkFormat);
  }

  //

  let zstd;

  if (container.supercompressionScheme === KHR_SUPERCOMPRESSION_ZSTD) {
    if (!_zstd) {
      _zstd = (async () => {
        const decoder = new ZSTDDecoder();
        await decoder.init();
        return decoder;
      })();
    }

    zstd = await _zstd;
  }

  //

  const mipmaps = [];

  for (let levelIndex = 0; levelIndex < container.levels.length; levelIndex++) {
    const levelWidth = Math.max(1, container.pixelWidth >> levelIndex);
    const levelHeight = Math.max(1, container.pixelHeight >> levelIndex);
    const levelDepth = container.pixelDepth ? Math.max(1, container.pixelDepth >> levelIndex) : 0;

    const level = container.levels[levelIndex];

    let levelData;

    if (container.supercompressionScheme === KHR_SUPERCOMPRESSION_NONE) {
      levelData = level.levelData;
    } else if (container.supercompressionScheme === KHR_SUPERCOMPRESSION_ZSTD) {
      levelData = zstd.decode(level.levelData, level.uncompressedByteLength);
    } else {
      throw new Error('KTX2Loader: Unsupported supercompressionScheme.');
    }

    let data;

    if (TYPE_MAP[vkFormat] === FloatType) {
      data = new Float32Array(
        levelData.buffer,
        levelData.byteOffset,
        levelData.byteLength / Float32Array.BYTES_PER_ELEMENT
      );
    } else if (TYPE_MAP[vkFormat] === HalfFloatType) {
      data = new Uint16Array(
        levelData.buffer,
        levelData.byteOffset,
        levelData.byteLength / Uint16Array.BYTES_PER_ELEMENT
      );
    } else if (
      TYPE_MAP[vkFormat] === UnsignedInt5999Type ||
      TYPE_MAP[vkFormat] === UnsignedInt101111Type
    ) {
      data = new Uint32Array(
        levelData.buffer,
        levelData.byteOffset,
        levelData.byteLength / Uint32Array.BYTES_PER_ELEMENT
      );
    } else {
      data = levelData;
    }

    mipmaps.push({
      data: data,
      width: levelWidth,
      height: levelHeight,
      depth: levelDepth
    });
  }

  // levelCount = 0 implies runtime-generated mipmaps.
  const useMipmaps = container.levelCount === 0 || mipmaps.length > 1;

  let texture;

  if (UNCOMPRESSED_FORMATS.has(FORMAT_MAP[vkFormat])) {
    texture =
      container.pixelDepth === 0 ?
        new DataTexture(mipmaps[0].data, container.pixelWidth, container.pixelHeight)
      : new Data3DTexture(
          mipmaps[0].data,
          container.pixelWidth,
          container.pixelHeight,
          container.pixelDepth
        );
    texture.minFilter = useMipmaps ? NearestMipmapNearestFilter : NearestFilter;
    texture.magFilter = NearestFilter;
    texture.generateMipmaps = container.levelCount === 0;
  } else {
    if (container.pixelDepth > 0) throw new Error('KTX2Loader: Unsupported pixelDepth.');

    texture = new CompressedTexture(mipmaps, container.pixelWidth, container.pixelHeight);
    texture.minFilter = useMipmaps ? LinearMipmapLinearFilter : LinearFilter;
    texture.magFilter = LinearFilter;
  }

  texture.mipmaps = mipmaps;

  texture.type = TYPE_MAP[vkFormat];
  texture.format = FORMAT_MAP[vkFormat];
  texture.colorSpace = _parseColorSpace(container);
  texture.needsUpdate = true;

  //

  return Promise.resolve(texture);
}

function _parseColorSpace(container) {
  const dfd = container.dataFormatDescriptor[0];

  if (dfd.colorPrimaries === KHR_DF_PRIMARIES_BT709) {
    return dfd.transferFunction === KHR_DF_TRANSFER_SRGB ? SRGBColorSpace : LinearSRGBColorSpace;
  } else if (dfd.colorPrimaries === KHR_DF_PRIMARIES_DISPLAYP3) {
    return dfd.transferFunction === KHR_DF_TRANSFER_SRGB ?
        DisplayP3ColorSpace
      : LinearDisplayP3ColorSpace;
  } else if (dfd.colorPrimaries === KHR_DF_PRIMARIES_UNSPECIFIED) {
    return NoColorSpace;
  } else {
    console.warn(`KTX2Loader: Unsupported color primaries, "${dfd.colorPrimaries}"`);
    return NoColorSpace;
  }
}

const _taskCache = new WeakMap();

let _activeLoaders = 0;

export { KTX2Loader };
