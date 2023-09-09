import { MeshPhysicalMaterial } from '@renderlayer/materials';

import { EXTENSIONS } from './EXTENSIONS';

/**
 * Iridescence Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_iridescence
 */
export class GLTFMaterialsIridescenceExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_IRIDESCENCE;
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

    if (extension.iridescenceFactor !== undefined) {
      materialParams.iridescence = extension.iridescenceFactor;
    }

    if (extension.iridescenceTexture !== undefined) {
      pending.push(
        parser.assignTexture(materialParams, 'iridescenceMap', extension.iridescenceTexture)
      );
    }

    if (extension.iridescenceIor !== undefined) {
      materialParams.iridescenceIOR = extension.iridescenceIor;
    }

    if (materialParams.iridescenceThicknessRange === undefined) {
      materialParams.iridescenceThicknessRange = [100, 400];
    }

    if (extension.iridescenceThicknessMinimum !== undefined) {
      materialParams.iridescenceThicknessRange[0] = extension.iridescenceThicknessMinimum;
    }

    if (extension.iridescenceThicknessMaximum !== undefined) {
      materialParams.iridescenceThicknessRange[1] = extension.iridescenceThicknessMaximum;
    }

    if (extension.iridescenceThicknessTexture !== undefined) {
      pending.push(
        parser.assignTexture(
          materialParams,
          'iridescenceThicknessMap',
          extension.iridescenceThicknessTexture
        )
      );
    }

    return Promise.all(pending);
  }
}
