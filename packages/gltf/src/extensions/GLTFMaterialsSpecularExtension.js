import { MeshPhysicalMaterial } from '@renderlayer/materials';
import { Color } from '@renderlayer/math';
import { LinearSRGBColorSpace, SRGBColorSpace } from '@renderlayer/shared';

import { EXTENSIONS, getMaterialExtension } from './EXTENSIONS';

/**
 * @import { GLTFParser } from "../GLTFParser"
 */

/**
 * Materials specular Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular
 */
export class GLTFMaterialsSpecularExtension {
  parser;
  name = EXTENSIONS.KHR_MATERIALS_SPECULAR;

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

    materialParams.specularIntensity =
      extension.specularFactor !== undefined ? extension.specularFactor : 1;

    if (extension.specularTexture !== undefined) {
      pending.push(
        this.parser.assignTexture(materialParams, 'specularIntensityMap', extension.specularTexture)
      );
    }

    const colorArray = extension.specularColorFactor || [1, 1, 1];
    materialParams.specularColor = new Color().setRGB(
      colorArray[0],
      colorArray[1],
      colorArray[2],
      LinearSRGBColorSpace
    );

    if (extension.specularColorTexture !== undefined) {
      pending.push(
        this.parser.assignTexture(
          materialParams,
          'specularColorMap',
          extension.specularColorTexture,
          SRGBColorSpace
        )
      );
    }

    return Promise.all(pending);
  }
}
