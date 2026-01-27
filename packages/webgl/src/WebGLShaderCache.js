class WebGLShaderCache {
  shaderCache = new Map();
  materialCache = new Map();

  update(material) {
    const vertexShader = material.vertexShader;
    const fragmentShader = material.fragmentShader;

    const vertexShaderStage = this.#getShaderStage(vertexShader);
    const fragmentShaderStage = this.#getShaderStage(fragmentShader);

    const materialShaders = this.#getShaderCacheForMaterial(material);

    if (materialShaders.has(vertexShaderStage) === false) {
      materialShaders.add(vertexShaderStage);
      vertexShaderStage.usedTimes++;
    }

    if (materialShaders.has(fragmentShaderStage) === false) {
      materialShaders.add(fragmentShaderStage);
      fragmentShaderStage.usedTimes++;
    }

    return this;
  }

  remove(material) {
    const materialShaders = this.materialCache.get(material);

    for (const shaderStage of materialShaders) {
      shaderStage.usedTimes--;

      if (shaderStage.usedTimes === 0) this.shaderCache.delete(shaderStage.code);
    }

    this.materialCache.delete(material);

    return this;
  }

  getVertexShaderID(material) {
    return this.#getShaderStage(material.vertexShader).id;
  }

  getFragmentShaderID(material) {
    return this.#getShaderStage(material.fragmentShader).id;
  }

  dispose() {
    this.shaderCache.clear();
    this.materialCache.clear();
  }

  #getShaderCacheForMaterial(material) {
    const cache = this.materialCache;
    let set = cache.get(material);

    if (set === undefined) {
      set = new Set();
      cache.set(material, set);
    }

    return set;
  }

  #getShaderStage(code) {
    const cache = this.shaderCache;
    let stage = cache.get(code);

    if (stage === undefined) {
      stage = new WebGLShaderStage(code);
      cache.set(code, stage);
    }

    return stage;
  }
}

class WebGLShaderStage {
  id = _shaderStageId++;

  code;
  usedTimes = 0;

  constructor(code) {
    this.code = code;
  }
}

let _shaderStageId = 0;

export { WebGLShaderCache, WebGLShaderStage };
