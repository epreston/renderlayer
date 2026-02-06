import { EXTENSIONS } from './EXTENSIONS';

/**
 * meshopt BufferView Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_meshopt_compression
 */
export class GLTFMeshoptCompression {
  constructor(parser, name = EXTENSIONS.KHR_MESHOPT_COMPRESSION) {
    this.name = name;
    this.parser = parser;
  }

  loadBufferView(index) {
    const json = this.parser.json;
    const bufferView = json.bufferViews[index];

    if (bufferView.extensions && bufferView.extensions[this.name]) {
      const extensionDef = bufferView.extensions[this.name];

      const buffer = this.parser.getDependency('buffer', extensionDef.buffer);
      const decoder = this.parser.options.meshoptDecoder;

      if (!decoder || !decoder.supported) {
        if (json.extensionsRequired && json.extensionsRequired.includes(this.name)) {
          throw new Error(
            'GLTFLoader: setMeshoptDecoder must be called before loading compressed files'
          );
        } else {
          // Assumes that the extension is optional and that fallback buffer data is present
          return null;
        }
      }

      return buffer.then(function (res) {
        const byteOffset = extensionDef.byteOffset || 0;
        const byteLength = extensionDef.byteLength || 0;

        const count = extensionDef.count;
        const stride = extensionDef.byteStride;

        const source = new Uint8Array(res, byteOffset, byteLength);

        if (decoder.decodeGltfBufferAsync) {
          return decoder
            .decodeGltfBufferAsync(count, stride, source, extensionDef.mode, extensionDef.filter)
            .then(function (res) {
              return res.buffer;
            });
        } else {
          // Support for MeshoptDecoder 0.18 or earlier, without decodeGltfBufferAsync
          return decoder.ready.then(function () {
            const result = new ArrayBuffer(count * stride);
            decoder.decodeGltfBuffer(
              new Uint8Array(result),
              count,
              stride,
              source,
              extensionDef.mode,
              extensionDef.filter
            );
            return result;
          });
        }
      });
    } else {
      return null;
    }
  }
}
