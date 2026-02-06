import { EXTENSIONS, getMaterialExtension } from './EXTENSIONS';

/**
 * @import { GLTFParser } from "../GLTFParser"
 */

/**
 * Materials Emissive Strength Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/blob/5768b3ce0ef32bc39cdf1bef10b948586635ead3/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md
 */
export class GLTFMaterialsEmissiveStrengthExtension {
  parser;
  name = EXTENSIONS.KHR_MATERIALS_EMISSIVE_STRENGTH;

  /** @param {GLTFParser} parser  */
  constructor(parser) {
    this.parser = parser;
  }

  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);

    if (extension === null) return Promise.resolve();

    if (extension.emissiveStrength !== undefined) {
      materialParams.emissiveIntensity = extension.emissiveStrength;
    }

    return Promise.resolve();
  }
}
