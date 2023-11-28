/**
 * @param {Object3D|Material|BufferGeometry} object
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
