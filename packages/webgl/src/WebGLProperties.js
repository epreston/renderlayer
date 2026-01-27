class WebGLProperties {
  #properties = new WeakMap();

  dispose() {
    this.#properties = new WeakMap();
  }

  get(object) {
    let map = this.#properties.get(object);

    if (map === undefined) {
      map = {};
      this.#properties.set(object, map);
    }

    return map;
  }

  remove(object) {
    this.#properties.delete(object);
  }

  update(object, key, value) {
    this.#properties.get(object)[key] = value;
  }
}

export { WebGLProperties };
