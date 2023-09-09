import { MeshPhysicalMaterial } from '@renderlayer/materials';
import { Color } from '@renderlayer/math';
import { LinearSRGBColorSpace, SRGBColorSpace } from '@renderlayer/shared';

import { EXTENSIONS } from './EXTENSIONS';

/**
 * Sheen Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_sheen
 */
export class GLTFMaterialsSheenExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_SHEEN;
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

    materialParams.sheenColor = new Color(0, 0, 0);
    materialParams.sheenRoughness = 0;
    materialParams.sheen = 1;

    const extension = materialDef.extensions[this.name];

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
        parser.assignTexture(
          materialParams,
          'sheenColorMap',
          extension.sheenColorTexture,
          SRGBColorSpace
        )
      );
    }

    if (extension.sheenRoughnessTexture !== undefined) {
      pending.push(
        parser.assignTexture(materialParams, 'sheenRoughnessMap', extension.sheenRoughnessTexture)
      );
    }

    return Promise.all(pending);
  }
}
