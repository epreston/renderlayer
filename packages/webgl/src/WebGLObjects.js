class WebGLObjects {
  #gl;
  #geometries;
  #attributes;
  #info;

  #updateMap = new WeakMap();

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {import('./WebGLGeometries.js').WebGLGeometries} geometries
   * @param {import('./WebGLAttributes.js').WebGLAttributes} attributes
   * @param {import('./WebGLInfo.js').WebGLInfo} info
   */
  constructor(gl, geometries, attributes, info) {
    this.#gl = gl;
    this.#geometries = geometries;
    this.#attributes = attributes;
    this.#info = info;
  }

  update(object) {
    const frame = this.#info.render.frame;

    const geometry = object.geometry;
    const buffergeometry = this.#geometries.get(object, geometry);

    // Update once per frame

    if (this.#updateMap.get(buffergeometry) !== frame) {
      this.#geometries.update(buffergeometry);

      this.#updateMap.set(buffergeometry, frame);
    }

    if (object.isInstancedMesh) {
      if (object.hasEventListener('dispose', this._onInstancedMeshDispose) === false) {
        object.addEventListener('dispose', this._onInstancedMeshDispose);
      }

      if (this.#updateMap.get(object) !== frame) {
        this.#attributes.update(object.instanceMatrix, this.#gl.ARRAY_BUFFER);

        if (object.instanceColor !== null) {
          this.#attributes.update(object.instanceColor, this.#gl.ARRAY_BUFFER);
        }

        this.#updateMap.set(object, frame);
      }
    }

    if (object.isSkinnedMesh) {
      const skeleton = object.skeleton;

      if (this.#updateMap.get(skeleton) !== frame) {
        skeleton.update();

        this.#updateMap.set(skeleton, frame);
      }
    }

    return buffergeometry;
  }

  dispose() {
    this.#updateMap = new WeakMap();
  }

  _onInstancedMeshDispose(event) {
    const instancedMesh = event.target;

    instancedMesh.removeEventListener('dispose', this._onInstancedMeshDispose);

    this.#attributes.remove(instancedMesh.instanceMatrix);

    if (instancedMesh.instanceColor !== null) this.#attributes.remove(instancedMesh.instanceColor);
  }
}

export { WebGLObjects };
