class WebGLObjects {
  /** @param {WebGL2RenderingContext} gl */
  constructor(gl, geometries, attributes, info) {
    this._gl = gl;
    this._geometries = geometries;
    this._attributes = attributes;
    this._info = info;

    this._updateMap = new WeakMap();
  }

  update(object) {
    const frame = this._info.render.frame;

    const geometry = object.geometry;
    const buffergeometry = this._geometries.get(object, geometry);

    // Update once per frame

    if (this._updateMap.get(buffergeometry) !== frame) {
      this._geometries.update(buffergeometry);

      this._updateMap.set(buffergeometry, frame);
    }

    if (object.isInstancedMesh) {
      if (object.hasEventListener('dispose', this._onInstancedMeshDispose) === false) {
        object.addEventListener('dispose', this._onInstancedMeshDispose);
      }

      if (this._updateMap.get(object) !== frame) {
        this._attributes.update(object.instanceMatrix, this._gl.ARRAY_BUFFER);

        if (object.instanceColor !== null) {
          this._attributes.update(object.instanceColor, this._gl.ARRAY_BUFFER);
        }

        this._updateMap.set(object, frame);
      }
    }

    if (object.isSkinnedMesh) {
      const skeleton = object.skeleton;

      if (this._updateMap.get(skeleton) !== frame) {
        skeleton.update();

        this._updateMap.set(skeleton, frame);
      }
    }

    return buffergeometry;
  }

  dispose() {
    this._updateMap = new WeakMap();
  }

  _onInstancedMeshDispose(event) {
    const instancedMesh = event.target;

    instancedMesh.removeEventListener('dispose', this._onInstancedMeshDispose);

    this._attributes.remove(instancedMesh.instanceMatrix);

    if (instancedMesh.instanceColor !== null) this._attributes.remove(instancedMesh.instanceColor);
  }
}

export { WebGLObjects };
