import {
  CubeReflectionMapping,
  CubeRefractionMapping,
  EquirectangularReflectionMapping,
  EquirectangularRefractionMapping
} from '@renderlayer/shared';
import { PMREMGenerator } from '@renderlayer/pmrem';
import { WebGLCubeRenderTarget } from '@renderlayer/targets';

/**
 * @import { WebGLRenderer } from "@renderlayer/renderers"
 */

class WebGLEnvironments {
  #renderer;

  #cubeMaps = new WeakMap();
  #pmremMaps = new WeakMap();

  #pmremGenerator = null;

  /**
   * @param {WebGLRenderer} renderer
   */
  constructor(renderer) {
    this.#renderer = renderer;
  }

  get(texture, usePMREM = false) {
    // public
    if (texture === null || texture === undefined) return null;

    if (usePMREM) {
      return this.#getPMREM(texture);
    }

    return this.#getCube(texture);
  }

  #getCube(texture) {
    if (texture && texture.isTexture) {
      const mapping = texture.mapping;

      if (
        mapping === EquirectangularReflectionMapping ||
        mapping === EquirectangularRefractionMapping
      ) {
        if (this.#cubeMaps.has(texture)) {
          const cubemap = this.#cubeMaps.get(texture).texture;
          return this.#mapTextureMapping(cubemap, texture.mapping);
        } else {
          const image = texture.image;

          if (image && image.height > 0) {
            const renderTarget = new WebGLCubeRenderTarget(image.height);
            renderTarget.fromEquirectangularTexture(this.#renderer, texture);
            this.#cubeMaps.set(texture, renderTarget);

            texture.addEventListener('dispose', this.onCubemapDispose);

            return this.#mapTextureMapping(renderTarget.texture, texture.mapping);
          } else {
            // image not yet ready. try the conversion next frame

            return null;
          }
        }
      }
    }

    return texture;
  }

  #getPMREM(texture) {
    if (texture && texture.isTexture) {
      const mapping = texture.mapping;

      const isEquirectMap =
        mapping === EquirectangularReflectionMapping ||
        mapping === EquirectangularRefractionMapping;
      const isCubeMap = mapping === CubeReflectionMapping || mapping === CubeRefractionMapping;

      // equirect/cube map to cubeUV conversion

      if (isEquirectMap || isCubeMap) {
        let renderTarget = this.#pmremMaps.get(texture);

        const currentPMREMVersion =
          renderTarget !== undefined ? renderTarget.texture.pmremVersion : 0;

        if (texture.isRenderTargetTexture && texture.pmremVersion !== currentPMREMVersion) {
          if (this.#pmremGenerator === null)
            this.#pmremGenerator = new PMREMGenerator(this.#renderer);

          renderTarget =
            isEquirectMap ?
              this.#pmremGenerator.fromEquirectangular(texture, renderTarget)
            : this.#pmremGenerator.fromCubemap(texture, renderTarget);
          renderTarget.texture.pmremVersion = texture.pmremVersion;

          this.#pmremMaps.set(texture, renderTarget);

          return renderTarget.texture;
        } else {
          if (renderTarget !== undefined) {
            return renderTarget.texture;
          } else {
            const image = texture.image;

            if (
              (isEquirectMap && image && image.height > 0) ||
              (isCubeMap && image && this.#isCubeTextureComplete(image))
            ) {
              if (this.#pmremGenerator === null)
                this.#pmremGenerator = new PMREMGenerator(this.#renderer);

              renderTarget =
                isEquirectMap ?
                  this.#pmremGenerator.fromEquirectangular(texture)
                : this.#pmremGenerator.fromCubemap(texture);
              renderTarget.texture.pmremVersion = texture.pmremVersion;

              this.#pmremMaps.set(texture, renderTarget);

              texture.addEventListener('dispose', this.onPMREMDispose);

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

  #mapTextureMapping(texture, mapping) {
    if (mapping === EquirectangularReflectionMapping) {
      texture.mapping = CubeReflectionMapping;
    } else if (mapping === EquirectangularRefractionMapping) {
      texture.mapping = CubeRefractionMapping;
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

  onCubemapDispose(event) {
    const texture = event.target;

    texture.removeEventListener('dispose', this.onCubemapDispose);

    const cubemap = this.#cubeMaps.get(texture);

    if (cubemap !== undefined) {
      this.#cubeMaps.delete(texture);
      cubemap.dispose();
    }
  }

  onPMREMDispose(event) {
    const texture = event.target;

    texture.removeEventListener('dispose', this.onPMREMDispose);

    const pmrem = this.#pmremMaps.get(texture);

    if (pmrem !== undefined) {
      this.#pmremMaps.delete(texture);
      pmrem.dispose();
    }
  }

  dispose() {
    // public
    this.#cubeMaps = new WeakMap();
    this.#pmremMaps = new WeakMap();

    if (this.#pmremGenerator !== null) {
      this.#pmremGenerator.dispose();
      this.#pmremGenerator = null;
    }
  }
}

export { WebGLEnvironments };
