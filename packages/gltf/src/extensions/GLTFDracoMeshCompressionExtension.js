import { EXTENSIONS } from './EXTENSIONS';

import { ATTRIBUTES, WEBGL_COMPONENT_TYPES } from '../GLTFConstants';

/**
 * DRACO Mesh Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression
 */
export class GLTFDracoMeshCompressionExtension {
  constructor(json, dracoLoader) {
    if (!dracoLoader) {
      throw new Error('GLTFLoader: No DRACOLoader instance provided.');
    }

    this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION;
    this.json = json;
    this.dracoLoader = dracoLoader;
    this.dracoLoader.preload();
  }

  decodePrimitive(primitive, parser) {
    const json = this.json;
    const dracoLoader = this.dracoLoader;
    const bufferViewIndex = primitive.extensions[this.name].bufferView;
    const gltfAttributeMap = primitive.extensions[this.name].attributes;
    const threeAttributeMap = {};
    const attributeNormalizedMap = {};
    const attributeTypeMap = {};

    for (const attributeName in gltfAttributeMap) {
      const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();

      threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName];
    }

    for (const attributeName in primitive.attributes) {
      const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();

      if (gltfAttributeMap[attributeName] !== undefined) {
        const accessorDef = json.accessors[primitive.attributes[attributeName]];
        const componentType = WEBGL_COMPONENT_TYPES[accessorDef.componentType];

        attributeTypeMap[threeAttributeName] = componentType.name;
        attributeNormalizedMap[threeAttributeName] = accessorDef.normalized === true;
      }
    }

    return parser.getDependency('bufferView', bufferViewIndex).then(function (bufferView) {
      return new Promise(function (resolve) {
        dracoLoader.decodeDracoFile(
          bufferView,
          function (geometry) {
            for (const attributeName in geometry.attributes) {
              const attribute = geometry.attributes[attributeName];
              const normalized = attributeNormalizedMap[attributeName];

              if (normalized !== undefined) attribute.normalized = normalized;
            }

            resolve(geometry);
          },
          threeAttributeMap,
          attributeTypeMap
        );
      });
    });
  }
}
