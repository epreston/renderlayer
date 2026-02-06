import { Object3D } from '@renderlayer/core';
import { Matrix4, Quaternion, Vector3 } from '@renderlayer/math';
import { InstancedMesh } from '@renderlayer/objects';

import { WEBGL_CONSTANTS } from '../GLTFConstants';
import { EXTENSIONS } from './EXTENSIONS';

/**
 * @import { GLTFParser } from "../GLTFParser"
 */

/**
 * GPU Instancing Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_mesh_gpu_instancing
 *
 */
export class GLTFMeshGpuInstancing {
  /** @param {GLTFParser} parser  */
  constructor(parser) {
    this.name = EXTENSIONS.EXT_MESH_GPU_INSTANCING;
    this.parser = parser;
  }

  createNodeMesh(nodeIndex) {
    const json = this.parser.json;
    const nodeDef = json.nodes[nodeIndex];

    if (!nodeDef.extensions || !nodeDef.extensions[this.name] || nodeDef.mesh === undefined) {
      return null;
    }

    const meshDef = json.meshes[nodeDef.mesh];

    // No Points or Lines + Instancing support yet
    for (const primitive of meshDef.primitives) {
      if (
        primitive.mode !== WEBGL_CONSTANTS.TRIANGLES &&
        primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_STRIP &&
        primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_FAN &&
        primitive.mode !== undefined
      ) {
        return null;
      }
    }

    const extensionDef = nodeDef.extensions[this.name];
    const attributesDef = extensionDef.attributes;

    // @TODO: Can we support InstancedMesh + SkinnedMesh?
    const pending = [];
    const attributes = {};

    for (const key in attributesDef) {
      pending.push(
        this.parser.getDependency('accessor', attributesDef[key]).then((accessor) => {
          attributes[key] = accessor;
          return attributes[key];
        })
      );
    }

    if (pending.length < 1) {
      return null;
    }

    pending.push(this.parser.createNodeMesh(nodeIndex));

    return Promise.all(pending).then((results) => {
      const nodeObject = results.pop();
      const meshes = nodeObject.isGroup ? nodeObject.children : [nodeObject];
      const count = results[0].count; // All attribute counts should be same
      const instancedMeshes = [];

      for (const mesh of meshes) {
        // Temporal variables
        const m = new Matrix4();
        const p = new Vector3();
        const q = new Quaternion();
        const s = new Vector3(1, 1, 1);

        const instancedMesh = new InstancedMesh(mesh.geometry, mesh.material, count);

        for (let i = 0; i < count; i++) {
          if (attributes.TRANSLATION) {
            p.fromBufferAttribute(attributes.TRANSLATION, i);
          }

          if (attributes.ROTATION) {
            q.fromBufferAttribute(attributes.ROTATION, i);
          }

          if (attributes.SCALE) {
            s.fromBufferAttribute(attributes.SCALE, i);
          }

          instancedMesh.setMatrixAt(i, m.compose(p, q, s));
        }

        // Add instance attributes to the geometry, excluding TRS.
        for (const attributeName in attributes) {
          if (
            attributeName !== 'TRANSLATION' &&
            attributeName !== 'ROTATION' &&
            attributeName !== 'SCALE'
          ) {
            mesh.geometry.setAttribute(attributeName, attributes[attributeName]);
          }
        }

        // Just in case
        Object3D.prototype.copy.call(instancedMesh, mesh);

        this.parser.assignFinalMaterial(instancedMesh);

        instancedMeshes.push(instancedMesh);
      }

      if (nodeObject.isGroup) {
        nodeObject.clear();

        nodeObject.add(...instancedMeshes);

        return nodeObject;
      }

      return instancedMeshes[0];
    });
  }
}
