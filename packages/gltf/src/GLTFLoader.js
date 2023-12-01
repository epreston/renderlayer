import { FileLoader, Loader, LoaderUtils } from '@renderlayer/loaders';

import { GLTFLightsExtension } from './extensions/GLTFLightsExtension';
import { GLTFMaterialsUnlitExtension } from './extensions/GLTFMaterialsUnlitExtension';
import { GLTFMaterialsEmissiveStrengthExtension } from './extensions/GLTFMaterialsEmissiveStrengthExtension';
import { GLTFMaterialsClearcoatExtension } from './extensions/GLTFMaterialsClearcoatExtension';
import { GLTFMaterialsIridescenceExtension } from './extensions/GLTFMaterialsIridescenceExtension';
import { GLTFMaterialsSheenExtension } from './extensions/GLTFMaterialsSheenExtension';
import { GLTFMaterialsTransmissionExtension } from './extensions/GLTFMaterialsTransmissionExtension';
import { GLTFMaterialsVolumeExtension } from './extensions/GLTFMaterialsVolumeExtension';
import { GLTFMaterialsIorExtension } from './extensions/GLTFMaterialsIorExtension';
import { GLTFMaterialsSpecularExtension } from './extensions/GLTFMaterialsSpecularExtension';
import { GLTFMaterialsAnisotropyExtension } from './extensions/GLTFMaterialsAnisotropyExtension';
import { GLTFTextureBasisUExtension } from './extensions/GLTFTextureBasisUExtension';
import { GLTFTextureWebPExtension } from './extensions/GLTFTextureWebPExtension';
import { GLTFTextureAVIFExtension } from './extensions/GLTFTextureAVIFExtension';
import { GLTFMeshoptCompression } from './extensions/GLTFMeshoptCompression';
import { GLTFMeshGpuInstancing } from './extensions/GLTFMeshGpuInstancing';
import {
  BINARY_EXTENSION_HEADER_MAGIC,
  GLTFBinaryExtension
} from './extensions/GLTFBinaryExtension';
import { GLTFDracoMeshCompressionExtension } from './extensions/GLTFDracoMeshCompressionExtension';
import { GLTFTextureTransformExtension } from './extensions/GLTFTextureTransformExtension';
import { GLTFMeshQuantizationExtension } from './extensions/GLTFMeshQuantizationExtension';

import { EXTENSIONS } from './extensions/EXTENSIONS';
import { GLTFParser } from './GLTFParser';

// MeshPhysicalMaterial,

class GLTFLoader extends Loader {
  constructor(manager) {
    super(manager);

    this.dracoLoader = null;
    this.ktx2Loader = null;
    this.meshoptDecoder = null;

    this.pluginCallbacks = [];

    this.register(function (parser) {
      return new GLTFMaterialsClearcoatExtension(parser);
    });

    this.register(function (parser) {
      return new GLTFTextureBasisUExtension(parser);
    });

    this.register(function (parser) {
      return new GLTFTextureWebPExtension(parser);
    });

    this.register(function (parser) {
      return new GLTFTextureAVIFExtension(parser);
    });

    this.register(function (parser) {
      return new GLTFMaterialsSheenExtension(parser);
    });

    this.register(function (parser) {
      return new GLTFMaterialsTransmissionExtension(parser);
    });

    this.register(function (parser) {
      return new GLTFMaterialsVolumeExtension(parser);
    });

    this.register(function (parser) {
      return new GLTFMaterialsIorExtension(parser);
    });

    this.register(function (parser) {
      return new GLTFMaterialsEmissiveStrengthExtension(parser);
    });

    this.register(function (parser) {
      return new GLTFMaterialsSpecularExtension(parser);
    });

    this.register(function (parser) {
      return new GLTFMaterialsIridescenceExtension(parser);
    });

    this.register(function (parser) {
      return new GLTFMaterialsAnisotropyExtension(parser);
    });

    this.register(function (parser) {
      return new GLTFLightsExtension(parser);
    });

    this.register(function (parser) {
      return new GLTFMeshoptCompression(parser);
    });

    this.register(function (parser) {
      return new GLTFMeshGpuInstancing(parser);
    });
  }

  load(url, onLoad, onProgress, onError) {
    const scope = this;

    let resourcePath;

    if (this.resourcePath !== '') {
      resourcePath = this.resourcePath;
    } else if (this.path !== '') {
      // If a base path is set, resources will be relative paths from that plus the
      // relative path of the gltf file

      // Example  path = 'https://localhost/', url = 'assets/models/model.gltf'
      // resourcePath = 'https://localhost/assets/models/'

      // referenced resource 'model.bin' will be loaded from 'https://localhost/assets/models/model.bin'
      // referenced resource '../textures/texture.png' will be loaded from 'https://localhost/assets/textures/texture.png'
      const relativeUrl = LoaderUtils.extractUrlBase(url);
      resourcePath = LoaderUtils.resolveURL(relativeUrl, this.path);
    } else {
      resourcePath = LoaderUtils.extractUrlBase(url);
    }

    // Tells the LoadingManager to track an extra item, which resolves after
    // the model is fully loaded. This means the count of items loaded will
    // be incorrect, but ensures manager.onLoad() does not fire early.
    this.manager.itemStart(url);

    const _onError = function (e) {
      if (onError) {
        onError(e);
      } else {
        console.error(e);
      }

      scope.manager.itemError(url);
      scope.manager.itemEnd(url);
    };

    const loader = new FileLoader(this.manager);

    loader.setPath(this.path);
    loader.setResponseType('arraybuffer');
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);

    loader.load(
      url,
      function (data) {
        try {
          scope.parse(
            data,
            resourcePath,
            function (gltf) {
              onLoad(gltf);

              scope.manager.itemEnd(url);
            },
            _onError
          );
        } catch (e) {
          _onError(e);
        }
      },
      onProgress,
      _onError
    );
  }

  setDRACOLoader(dracoLoader) {
    this.dracoLoader = dracoLoader;
    return this;
  }

  setKTX2Loader(ktx2Loader) {
    this.ktx2Loader = ktx2Loader;
    return this;
  }

  setMeshoptDecoder(meshoptDecoder) {
    this.meshoptDecoder = meshoptDecoder;
    return this;
  }

  register(callback) {
    if (!this.pluginCallbacks.includes(callback)) {
      this.pluginCallbacks.push(callback);
    }

    return this;
  }

  unregister(callback) {
    if (this.pluginCallbacks.includes(callback)) {
      this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(callback), 1);
    }

    return this;
  }

  parse(data, path, onLoad, onError) {
    let json;
    const extensions = {};
    const plugins = {};
    const textDecoder = new TextDecoder();

    if (typeof data === 'string') {
      json = JSON.parse(data);
    } else if (data instanceof ArrayBuffer) {
      const magic = textDecoder.decode(new Uint8Array(data, 0, 4));

      if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
        try {
          extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(data);
        } catch (error) {
          if (onError) onError(error);
          return;
        }

        json = JSON.parse(extensions[EXTENSIONS.KHR_BINARY_GLTF].content);
      } else {
        json = JSON.parse(textDecoder.decode(data));
      }
    } else {
      json = data;
    }

    if (json.asset === undefined || json.asset.version[0] < 2) {
      if (onError)
        onError(new Error('GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.'));
      return;
    }

    const parser = new GLTFParser(json, {
      path: path || this.resourcePath || '',
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    });

    parser.fileLoader.setRequestHeader(this.requestHeader);

    for (let i = 0; i < this.pluginCallbacks.length; i++) {
      const plugin = this.pluginCallbacks[i](parser);
      plugins[plugin.name] = plugin;

      // Workaround to avoid determining as unknown extension
      // in addUnknownExtensionsToUserData().
      // Remove this workaround if we move all the existing
      // extension handlers to plugin system
      extensions[plugin.name] = true;
    }

    if (json.extensionsUsed) {
      for (const extensionName of json.extensionsUsed) {
        const extensionsRequired = json.extensionsRequired || [];

        switch (extensionName) {
          case EXTENSIONS.KHR_MATERIALS_UNLIT:
            extensions[extensionName] = new GLTFMaterialsUnlitExtension();
            break;

          case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
            extensions[extensionName] = new GLTFDracoMeshCompressionExtension(
              json,
              this.dracoLoader
            );
            break;

          case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
            extensions[extensionName] = new GLTFTextureTransformExtension();
            break;

          case EXTENSIONS.KHR_MESH_QUANTIZATION:
            extensions[extensionName] = new GLTFMeshQuantizationExtension();
            break;

          default:
            if (
              extensionsRequired.includes(extensionName) &&
              plugins[extensionName] === undefined
            ) {
              console.warn(`GLTFLoader: Unknown extension "${extensionName}".`);
            }
        }
      }
    }

    parser.setExtensions(extensions);
    parser.setPlugins(plugins);
    parser.parse(onLoad, onError);
  }

  parseAsync(data, path) {
    const scope = this;

    return new Promise(function (resolve, reject) {
      scope.parse(data, path, resolve, reject);
    });
  }
}

export { GLTFLoader };
