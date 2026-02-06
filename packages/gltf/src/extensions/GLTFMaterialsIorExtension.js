import { MeshPhysicalMaterial } from '@renderlayer/materials';

import { EXTENSIONS, getMaterialExtension } from './EXTENSIONS';

/**
 * @import { GLTFParser } from "../GLTFParser"
 */

/**
 * Materials ior Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior
 */
export class GLTFMaterialsIorExtension {
  /** @param {GLTFParser} parser  */
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_IOR;
  }

  getMaterialType(materialIndex) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);

    return extension !== null ? MeshPhysicalMaterial : null;
  }

  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);

    if (extension === null) return Promise.resolve();

    materialParams.ior = extension.ior !== undefined ? extension.ior : 1.5;

    return Promise.resolve();
  }
}
