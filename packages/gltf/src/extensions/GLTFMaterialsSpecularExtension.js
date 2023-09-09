import { MeshPhysicalMaterial } from '@renderlayer/materials';
import { Color } from '@renderlayer/math';
import { LinearSRGBColorSpace, SRGBColorSpace } from '@renderlayer/shared';

import { EXTENSIONS } from './EXTENSIONS';

/**
 * Materials specular Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular
 */
export class GLTFMaterialsSpecularExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_SPECULAR;
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

    materialParams.specularIntensity =
      extension.specularFactor !== undefined ? extension.specularFactor : 1;

    if (extension.specularTexture !== undefined) {
      pending.push(
        parser.assignTexture(materialParams, 'specularIntensityMap', extension.specularTexture)
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
        parser.assignTexture(
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
