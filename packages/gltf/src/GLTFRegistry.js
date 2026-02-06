/* GLTFREGISTRY */

export class GLTFRegistry {
  #objects = {};

  get(key) {
    return this.#objects[key];
  }

  add(key, object) {
    this.#objects[key] = object;
  }

  remove(key) {
    delete this.#objects[key];
  }

  removeAll() {
    this.#objects = {};
  }
}
