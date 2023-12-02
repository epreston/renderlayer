class WebGLProperties {
  constructor() {
    this._properties = new WeakMap();
  }

  get(object) {
    let map = this._properties.get(object);

    if (map === undefined) {
      map = {};
      this._properties.set(object, map);
    }

    return map;
  }

  remove(object) {
    this._properties.delete(object);
  }

  update(object, key, value) {
    this._properties.get(object)[key] = value;
  }

  dispose() {
    this._properties = new WeakMap();
  }
}

export { WebGLProperties };
