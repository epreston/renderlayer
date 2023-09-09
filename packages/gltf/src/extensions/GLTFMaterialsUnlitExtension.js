import { MeshBasicMaterial } from '@renderlayer/materials';
import { Color } from '@renderlayer/math';
import { LinearSRGBColorSpace, SRGBColorSpace } from '@renderlayer/shared';

import { EXTENSIONS } from './EXTENSIONS';

/**
 * Unlit Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
 */
export class GLTFMaterialsUnlitExtension {
  constructor() {
    this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;
  }

  getMaterialType() {
    return MeshBasicMaterial;
  }

  extendParams(materialParams, materialDef, parser) {
    const pending = [];

    materialParams.color = new Color(1, 1, 1);
    materialParams.opacity = 1;

    const metallicRoughness = materialDef.pbrMetallicRoughness;

    if (metallicRoughness) {
      if (Array.isArray(metallicRoughness.baseColorFactor)) {
        const array = metallicRoughness.baseColorFactor;

        materialParams.color.setRGB(array[0], array[1], array[2], LinearSRGBColorSpace);
        materialParams.opacity = array[3];
      }

      if (metallicRoughness.baseColorTexture !== undefined) {
        pending.push(
          parser.assignTexture(
            materialParams,
            'map',
            metallicRoughness.baseColorTexture,
            SRGBColorSpace
          )
        );
      }
    }

    return Promise.all(pending);
  }
}
