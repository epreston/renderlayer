import { MeshPhysicalMaterial } from '@renderlayer/materials';
import { Color } from '@renderlayer/math';
import { LinearSRGBColorSpace } from '@renderlayer/shared';

import { EXTENSIONS } from './EXTENSIONS';

/**
 * Materials Volume Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
 */
export class GLTFMaterialsVolumeExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_VOLUME;
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

    materialParams.thickness =
      extension.thicknessFactor !== undefined ? extension.thicknessFactor : 0;

    if (extension.thicknessTexture !== undefined) {
      pending.push(
        parser.assignTexture(materialParams, 'thicknessMap', extension.thicknessTexture)
      );
    }

    materialParams.attenuationDistance = extension.attenuationDistance || Infinity;

    const colorArray = extension.attenuationColor || [1, 1, 1];
    materialParams.attenuationColor = new Color().setRGB(
      colorArray[0],
      colorArray[1],
      colorArray[2],
      LinearSRGBColorSpace
    );

    return Promise.all(pending);
  }
}
