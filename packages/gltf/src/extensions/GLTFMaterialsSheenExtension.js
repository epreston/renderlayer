import { MeshPhysicalMaterial } from '@renderlayer/materials';
import { Color } from '@renderlayer/math';
import { LinearSRGBColorSpace, SRGBColorSpace } from '@renderlayer/shared';

import { EXTENSIONS, getMaterialExtension } from './EXTENSIONS';

/**
 * @import { GLTFParser } from "../GLTFParser"
 */

/**
 * Sheen Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_sheen
 */
export class GLTFMaterialsSheenExtension {
  /** @param {GLTFParser} parser  */
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_SHEEN;
  }

  getMaterialType(materialIndex) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);

    return extension !== null ? MeshPhysicalMaterial : null;
  }

  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);

    if (extension === null) return Promise.resolve();

    const pending = [];

    materialParams.sheenColor = new Color(0, 0, 0);
    materialParams.sheenRoughness = 0;
    materialParams.sheen = 1;

    if (extension.sheenColorFactor !== undefined) {
      const colorFactor = extension.sheenColorFactor;
      materialParams.sheenColor.setRGB(
        colorFactor[0],
        colorFactor[1],
        colorFactor[2],
        LinearSRGBColorSpace
      );
    }

    if (extension.sheenRoughnessFactor !== undefined) {
      materialParams.sheenRoughness = extension.sheenRoughnessFactor;
    }

    if (extension.sheenColorTexture !== undefined) {
      pending.push(
        this.parser.assignTexture(
          materialParams,
          'sheenColorMap',
          extension.sheenColorTexture,
          SRGBColorSpace
        )
      );
    }

    if (extension.sheenRoughnessTexture !== undefined) {
      pending.push(
        this.parser.assignTexture(
          materialParams,
          'sheenRoughnessMap',
          extension.sheenRoughnessTexture
        )
      );
    }

    return Promise.all(pending);
  }
}
