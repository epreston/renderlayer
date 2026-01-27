import {
  CubeReflectionMapping,
  CubeRefractionMapping,
  EquirectangularReflectionMapping,
  EquirectangularRefractionMapping
} from '@renderlayer/shared';

import { PMREMGenerator } from '@renderlayer/pmrem';

class WebGLCubeUVMaps {
  #renderer;

  #cubeUVmaps = new WeakMap();
  #pmremGenerator = null;

  /** @param {import('@renderlayer/renderers').WebGLRenderer} renderer  */
  constructor(renderer) {
    this.#renderer = renderer;
  }

  get(texture) {
    if (texture && texture.isTexture) {
      const mapping = texture.mapping;

      const isEquirectMap =
        mapping === EquirectangularReflectionMapping ||
        mapping === EquirectangularRefractionMapping;
      const isCubeMap = mapping === CubeReflectionMapping || mapping === CubeRefractionMapping;

      // equirect/cube map to cubeUV conversion
      if (isEquirectMap || isCubeMap) {
        if (texture.isRenderTargetTexture && texture.needsPMREMUpdate === true) {
          texture.needsPMREMUpdate = false;

          let renderTarget = this.#cubeUVmaps.get(texture);

          if (this.#pmremGenerator === null)
            this.#pmremGenerator = new PMREMGenerator(this.#renderer);

          renderTarget =
            isEquirectMap ?
              this.#pmremGenerator.fromEquirectangular(texture, renderTarget)
            : this.#pmremGenerator.fromCubemap(texture, renderTarget);
          this.#cubeUVmaps.set(texture, renderTarget);

          return renderTarget.texture;
        } else {
          if (this.#cubeUVmaps.has(texture)) {
            return this.#cubeUVmaps.get(texture).texture;
          } else {
            const image = texture.image;

            if (
              (isEquirectMap && image && image.height > 0) ||
              (isCubeMap && image && this.#isCubeTextureComplete(image))
            ) {
              if (this.#pmremGenerator === null)
                this.#pmremGenerator = new PMREMGenerator(this.#renderer);

              const renderTarget =
                isEquirectMap ?
                  this.#pmremGenerator.fromEquirectangular(texture)
                : this.#pmremGenerator.fromCubemap(texture);
              this.#cubeUVmaps.set(texture, renderTarget);

              texture.addEventListener('dispose', this._onTextureDispose);

              return renderTarget.texture;
            } else {
              // image not yet ready. try the conversion next frame

              return null;
            }
          }
        }
      }
    }

    return texture;
  }

  #isCubeTextureComplete(image) {
    let count = 0;
    const length = 6;

    for (let i = 0; i < length; i++) {
      if (image[i] !== undefined) count++;
    }

    return count === length;
  }

  _onTextureDispose(event) {
    const texture = event.target;

    texture.removeEventListener('dispose', this._onTextureDispose);

    const cubemapUV = this.#cubeUVmaps.get(texture);

    if (cubemapUV !== undefined) {
      this.#cubeUVmaps.delete(texture);
      cubemapUV.dispose();
    }
  }

  dispose() {
    this._cubeUVmaps = new WeakMap();

    if (this.#pmremGenerator !== null) {
      this.#pmremGenerator.dispose();
      this.#pmremGenerator = null;
    }
  }
}

export { WebGLCubeUVMaps };
