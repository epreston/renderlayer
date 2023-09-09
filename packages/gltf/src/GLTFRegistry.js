/* GLTFREGISTRY */

export function GLTFRegistry() {
  let objects = {};

  return {
    get(key) {
      return objects[key];
    },

    add(key, object) {
      objects[key] = object;
    },

    remove(key) {
      delete objects[key];
    },

    removeAll() {
      objects = {};
    }
  };
}
