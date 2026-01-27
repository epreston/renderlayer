import { Matrix3, Plane } from '@renderlayer/math';

class WebGLClipping {
  #properties;

  #globalState = null;
  #numGlobalPlanes = 0;
  #localClippingEnabled = false;
  #renderingShadows = false;
  #uniform = { value: null, needsUpdate: false };

  uniform;
  numPlanes = 0;
  numIntersection = 0;

  constructor(properties) {
    this.#properties = properties;
    this.uniform = this.#uniform;
  }

  init(planes, enableLocalClipping) {
    const enabled =
      planes.length !== 0 ||
      enableLocalClipping ||
      // enable state of previous frame - the clipping code has to
      // run another frame in order to reset the state:
      this.#numGlobalPlanes !== 0 ||
      this.#localClippingEnabled;

    this.#localClippingEnabled = enableLocalClipping;

    this.#numGlobalPlanes = planes.length;

    return enabled;
  }

  beginShadows() {
    this.#renderingShadows = true;
    this.#projectPlanes(null);
  }

  endShadows() {
    this.#renderingShadows = false;
  }

  setGlobalState(planes, camera) {
    this.#globalState = this.#projectPlanes(planes, camera, 0);
  }

  setState(material, camera, useCache) {
    const planes = material.clippingPlanes;
    const clipIntersection = material.clipIntersection;
    const clipShadows = material.clipShadows;

    const materialProperties = this.#properties.get(material);

    if (
      !this.#localClippingEnabled ||
      planes === null ||
      planes.length === 0 ||
      (this.#renderingShadows && !clipShadows)
    ) {
      // there's no local clipping
      if (this.#renderingShadows) {
        // there's no global clipping
        this.#projectPlanes(null);
      } else {
        this.#resetGlobalState();
      }
    } else {
      const nGlobal = this.#renderingShadows ? 0 : this.#numGlobalPlanes;
      const lGlobal = nGlobal * 4;

      let dstArray = materialProperties.clippingState || null;

      this.#uniform.value = dstArray; // ensure unique state

      dstArray = this.#projectPlanes(planes, camera, lGlobal, useCache);

      for (let i = 0; i !== lGlobal; ++i) {
        dstArray[i] = this.#globalState[i];
      }

      materialProperties.clippingState = dstArray;
      this.numIntersection = clipIntersection ? this.numPlanes : 0;
      this.numPlanes += nGlobal;
    }
  }

  #resetGlobalState() {
    const globalState = this.#globalState;
    const numGlobalPlanes = this.#numGlobalPlanes;
    const uniform = this.#uniform;

    if (uniform.value !== globalState) {
      uniform.value = globalState;
      uniform.needsUpdate = numGlobalPlanes > 0;
    }

    this.numPlanes = numGlobalPlanes;
    this.numIntersection = 0;
  }

  #projectPlanes(planes, camera, dstOffset, skipTransform) {
    const uniform = this.#uniform;

    const nPlanes = planes !== null ? planes.length : 0;
    let dstArray = null;

    if (nPlanes !== 0) {
      dstArray = uniform.value;

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

      uniform.value = dstArray;
      uniform.needsUpdate = true;
    }

    this.numPlanes = nPlanes;
    this.numIntersection = 0;

    return dstArray;
  }
}

const _plane = /*@__PURE__*/ new Plane();
const _viewNormalMatrix = /*@__PURE__*/ new Matrix3();

export { WebGLClipping };
