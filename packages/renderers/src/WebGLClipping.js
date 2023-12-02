import { Matrix3, Plane } from '@renderlayer/math';

class WebGLClipping {
  constructor(properties) {
    this._properties = properties;

    this._globalState = null;
    this._numGlobalPlanes = 0;
    this._localClippingEnabled = false;
    this._renderingShadows = false;
    this._plane = new Plane();
    this._viewNormalMatrix = new Matrix3();
    this._uniform = { value: null, needsUpdate: false };

    this.uniform = this._uniform;
    this.numPlanes = 0;
    this.numIntersection = 0;
  }

  init(planes, enableLocalClipping) {
    const enabled =
      planes.length !== 0 ||
      enableLocalClipping ||
      // enable state of previous frame - the clipping code has to
      // run another frame in order to reset the state:
      this._numGlobalPlanes !== 0 ||
      this._localClippingEnabled;

    this._localClippingEnabled = enableLocalClipping;

    this._numGlobalPlanes = planes.length;

    return enabled;
  }

  beginShadows() {
    this._renderingShadows = true;
    this._projectPlanes(null);
  }

  endShadows() {
    this._renderingShadows = false;
  }

  setGlobalState(planes, camera) {
    this._globalState = this._projectPlanes(planes, camera, 0);
  }

  setState(material, camera, useCache) {
    const planes = material.clippingPlanes;
    const clipIntersection = material.clipIntersection;
    const clipShadows = material.clipShadows;

    const materialProperties = this._properties.get(material);

    if (
      !this._localClippingEnabled ||
      planes === null ||
      planes.length === 0 ||
      (this._renderingShadows && !clipShadows)
    ) {
      // there's no local clipping
      if (this._renderingShadows) {
        // there's no global clipping
        this._projectPlanes(null);
      } else {
        this._resetGlobalState();
      }
    } else {
      const nGlobal = this._renderingShadows ? 0 : this._numGlobalPlanes;
      const lGlobal = nGlobal * 4;

      let dstArray = materialProperties.clippingState || null;

      this._uniform.value = dstArray; // ensure unique state

      dstArray = this._projectPlanes(planes, camera, lGlobal, useCache);

      for (let i = 0; i !== lGlobal; ++i) {
        dstArray[i] = this._globalState[i];
      }

      materialProperties.clippingState = dstArray;
      this.numIntersection = clipIntersection ? this.numPlanes : 0;
      this.numPlanes += nGlobal;
    }
  }

  _resetGlobalState() {
    const { _globalState, _numGlobalPlanes, _uniform } = this;

    if (_uniform.value !== _globalState) {
      _uniform.value = _globalState;
      _uniform.needsUpdate = _numGlobalPlanes > 0;
    }

    this.numPlanes = _numGlobalPlanes;
    this.numIntersection = 0;
  }

  _projectPlanes(planes, camera, dstOffset, skipTransform) {
    const { _plane, _uniform, _viewNormalMatrix } = this;

    const nPlanes = planes !== null ? planes.length : 0;
    let dstArray = null;

    if (nPlanes !== 0) {
      dstArray = _uniform.value;

      if (skipTransform !== true || dstArray === null) {
        const flatSize = dstOffset + nPlanes * 4;
        const viewMatrix = camera.matrixWorldInverse;

        _viewNormalMatrix.getNormalMatrix(viewMatrix);

        if (dstArray === null || dstArray.length < flatSize) {
          dstArray = new Float32Array(flatSize);
        }

        for (let i = 0, i4 = dstOffset; i !== nPlanes; ++i, i4 += 4) {
          _plane.copy(planes[i]).applyMatrix4(viewMatrix, _viewNormalMatrix);

          _plane.normal.toArray(dstArray, i4);
          dstArray[i4 + 3] = _plane.constant;
        }
      }

      _uniform.value = dstArray;
      _uniform.needsUpdate = true;
    }

    this.numPlanes = nPlanes;
    this.numIntersection = 0;

    return dstArray;
  }
}

export { WebGLClipping };
