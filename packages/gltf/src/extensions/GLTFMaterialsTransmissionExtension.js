import { MeshPhysicalMaterial } from '@renderlayer/materials';

import { EXTENSIONS } from './EXTENSIONS';

/**
 * Transmission Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
 * Draft: https://github.com/KhronosGroup/glTF/pull/1698
 */
export class GLTFMaterialsTransmissionExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_TRANSMISSION;
  }

  getMaterialType(materialIndex) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;

    return MeshPhysicalMaterial;
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser;
    const materialDef = parser.json.materials[materialIndex];

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve();
    }

    const pending = [];

    const extension = materialDef.extensions[this.name];

    if (extension.transmissionFactor !== undefined) {
      materialParams.transmission = extension.transmissionFactor;
    }

    if (extension.transmissionTexture !== undefined) {
      pending.push(
        parser.assignTexture(materialParams, 'transmissionMap', extension.transmissionTexture)
      );
    }

    return Promise.all(pending);
  }
}
