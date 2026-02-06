/**
 * @import { Object3D } from "@renderlayer/core"
 * @import { Material } from "@renderlayer/materials"
 * @import { BufferGeometry } from '@renderlayer/buffers'
 * @import { AnimationClip } from '@renderlayer/animation'
 */

/**
 * @param {Object3D|Material|BufferGeometry|Object|AnimationClip} object
 * @param {GLTF.definition} gltfDef
 */
export function assignExtrasToUserData(object, gltfDef) {
  if (gltfDef.extras !== undefined) {
    if (typeof gltfDef.extras === 'object') {
      Object.assign(object.userData, gltfDef.extras);
    } else {
      console.warn(`GLTFLoader: Ignoring primitive type .extras, ${gltfDef.extras}`);
    }
  }
}
