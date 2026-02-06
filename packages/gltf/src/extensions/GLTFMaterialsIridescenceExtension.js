import { MeshPhysicalMaterial } from '@renderlayer/materials';

import { EXTENSIONS, getMaterialExtension } from './EXTENSIONS';

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
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);

    return extension !== null ? MeshPhysicalMaterial : null;
  }

  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);

    if (extension === null) return Promise.resolve();

    const pending = [];

    if (extension.iridescenceFactor !== undefined) {
      materialParams.iridescence = extension.iridescenceFactor;
    }

    if (extension.iridescenceTexture !== undefined) {
      pending.push(
        this.parser.assignTexture(materialParams, 'iridescenceMap', extension.iridescenceTexture)
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
        this.parser.assignTexture(
          materialParams,
          'iridescenceThicknessMap',
          extension.iridescenceThicknessTexture
        )
      );
    }

    return Promise.all(pending);
  }
}
