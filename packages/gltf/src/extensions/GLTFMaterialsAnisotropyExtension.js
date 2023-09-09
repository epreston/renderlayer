import { MeshPhysicalMaterial } from '@renderlayer/materials';

import { EXTENSIONS } from './EXTENSIONS';

/**
 * Materials anisotropy Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_anisotropy
 */
export class GLTFMaterialsAnisotropyExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_ANISOTROPY;
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

    if (extension.anisotropyStrength !== undefined) {
      materialParams.anisotropy = extension.anisotropyStrength;
    }

    if (extension.anisotropyRotation !== undefined) {
      materialParams.anisotropyRotation = extension.anisotropyRotation;
    }

    if (extension.anisotropyTexture !== undefined) {
      pending.push(
        parser.assignTexture(materialParams, 'anisotropyMap', extension.anisotropyTexture)
      );
    }

    return Promise.all(pending);
  }
}
