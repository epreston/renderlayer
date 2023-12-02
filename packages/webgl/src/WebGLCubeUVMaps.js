import {
  CubeReflectionMapping,
  CubeRefractionMapping,
  EquirectangularReflectionMapping,
  EquirectangularRefractionMapping
} from '@renderlayer/shared';

import { PMREMGenerator } from '@renderlayer/pmrem';

class WebGLCubeUVMaps {
  constructor(renderer) {
    this._renderer = renderer;

    this._cubeUVmaps = new WeakMap();
    this._pmremGenerator = null;
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

          let renderTarget = this._cubeUVmaps.get(texture);

          if (this._pmremGenerator === null)
            this._pmremGenerator = new PMREMGenerator(this._renderer);

          renderTarget =
            isEquirectMap ?
              this._pmremGenerator.fromEquirectangular(texture, renderTarget)
            : this._pmremGenerator.fromCubemap(texture, renderTarget);
          this._cubeUVmaps.set(texture, renderTarget);

          return renderTarget.texture;
        } else {
          if (this._cubeUVmaps.has(texture)) {
            return this._cubeUVmaps.get(texture).texture;
          } else {
            const image = texture.image;

            if (
              (isEquirectMap && image && image.height > 0) ||
              (isCubeMap && image && this._isCubeTextureComplete(image))
            ) {
              if (this._pmremGenerator === null)
                this._pmremGenerator = new PMREMGenerator(this._renderer);

              const renderTarget =
                isEquirectMap ?
                  this._pmremGenerator.fromEquirectangular(texture)
                : this._pmremGenerator.fromCubemap(texture);
              this._cubeUVmaps.set(texture, renderTarget);

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

  _isCubeTextureComplete(image) {
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

    const cubemapUV = this._cubeUVmaps.get(texture);

    if (cubemapUV !== undefined) {
      this._cubeUVmaps.delete(texture);
      cubemapUV.dispose();
    }
  }

  dispose() {
    this._cubeUVmaps = new WeakMap();

    if (this._pmremGenerator !== null) {
      this._pmremGenerator.dispose();
      this._pmremGenerator = null;
    }
  }
}

export { WebGLCubeUVMaps };
