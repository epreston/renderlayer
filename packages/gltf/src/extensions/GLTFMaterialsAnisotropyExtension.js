import { MeshPhysicalMaterial } from '@renderlayer/materials';

import { EXTENSIONS, getMaterialExtension } from './EXTENSIONS';

/**
 * @import { GLTFParser } from "../GLTFParser"
 */

/**
 * Materials anisotropy Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_anisotropy
 */
export class GLTFMaterialsAnisotropyExtension {
  parser;
  name = EXTENSIONS.KHR_MATERIALS_ANISOTROPY;

  /** @param {GLTFParser} parser  */
  constructor(parser) {
    this.parser = parser;
  }

  getMaterialType(materialIndex) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);

    return extension !== null ? MeshPhysicalMaterial : null;
  }

  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);

    if (extension === null) return Promise.resolve();

    const pending = [];

    if (extension.anisotropyStrength !== undefined) {
      materialParams.anisotropy = extension.anisotropyStrength;
    }

    if (extension.anisotropyRotation !== undefined) {
      materialParams.anisotropyRotation = extension.anisotropyRotation;
    }

    if (extension.anisotropyTexture !== undefined) {
      pending.push(
        this.parser.assignTexture(materialParams, 'anisotropyMap', extension.anisotropyTexture)
      );
    }

    return Promise.all(pending);
  }
}
