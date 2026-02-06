import { MeshPhysicalMaterial } from '@renderlayer/materials';
import { Color } from '@renderlayer/math';
import { LinearSRGBColorSpace } from '@renderlayer/shared';

import { EXTENSIONS, getMaterialExtension } from './EXTENSIONS';

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
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);

    return extension !== null ? MeshPhysicalMaterial : null;
  }

  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);

    if (extension === null) return Promise.resolve();

    const pending = [];

    materialParams.thickness =
      extension.thicknessFactor !== undefined ? extension.thicknessFactor : 0;

    if (extension.thicknessTexture !== undefined) {
      pending.push(
        this.parser.assignTexture(materialParams, 'thicknessMap', extension.thicknessTexture)
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
