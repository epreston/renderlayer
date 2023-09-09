import { MeshPhysicalMaterial } from '@renderlayer/materials';
import { Vector2 } from '@renderlayer/math';

import { EXTENSIONS } from './EXTENSIONS';

/**
 * Clearcoat Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
 */
export class GLTFMaterialsClearcoatExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT;
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

    if (extension.clearcoatFactor !== undefined) {
      materialParams.clearcoat = extension.clearcoatFactor;
    }

    if (extension.clearcoatTexture !== undefined) {
      pending.push(
        parser.assignTexture(materialParams, 'clearcoatMap', extension.clearcoatTexture)
      );
    }

    if (extension.clearcoatRoughnessFactor !== undefined) {
      materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor;
    }

    if (extension.clearcoatRoughnessTexture !== undefined) {
      pending.push(
        parser.assignTexture(
          materialParams,
          'clearcoatRoughnessMap',
          extension.clearcoatRoughnessTexture
        )
      );
    }

    if (extension.clearcoatNormalTexture !== undefined) {
      pending.push(
        parser.assignTexture(materialParams, 'clearcoatNormalMap', extension.clearcoatNormalTexture)
      );

      if (extension.clearcoatNormalTexture.scale !== undefined) {
        const scale = extension.clearcoatNormalTexture.scale;

        materialParams.clearcoatNormalScale = new Vector2(scale, scale);
      }
    }

    return Promise.all(pending);
  }
}
