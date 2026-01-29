import {
  CubeReflectionMapping,
  CubeRefractionMapping,
  EquirectangularReflectionMapping,
  EquirectangularRefractionMapping
} from '@renderlayer/shared';
import { WebGLCubeRenderTarget } from '@renderlayer/targets';

/**
 * @import { WebGLRenderer } from "@renderlayer/renderers"
 */

class WebGLCubeMaps {
  #renderer;
  #cubemaps = new WeakMap();

  /** @param {WebGLRenderer} renderer  */
  constructor(renderer) {
    this.#renderer = renderer;
  }

  #mapTextureMapping(texture, mapping) {
    if (mapping === EquirectangularReflectionMapping) {
      texture.mapping = CubeReflectionMapping;
    } else if (mapping === EquirectangularRefractionMapping) {
      texture.mapping = CubeRefractionMapping;
    }

    return texture;
  }

  get(texture) {
    if (texture && texture.isTexture) {
      const mapping = texture.mapping;

      if (
        mapping === EquirectangularReflectionMapping ||
        mapping === EquirectangularRefractionMapping
      ) {
        if (this.#cubemaps.has(texture)) {
          const cubemap = this.#cubemaps.get(texture).texture;
          return this.#mapTextureMapping(cubemap, texture.mapping);
        } else {
          const image = texture.image;

          if (image && image.height > 0) {
            const renderTarget = new WebGLCubeRenderTarget(image.height / 2);
            renderTarget.fromEquirectangularTexture(this.#renderer, texture);
            this.#cubemaps.set(texture, renderTarget);

            texture.addEventListener('dispose', this._onTextureDispose);

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

  _onTextureDispose(event) {
    const texture = event.target;

    texture.removeEventListener('dispose', this._onTextureDispose);

    const cubemap = this.#cubemaps.get(texture);

    if (cubemap !== undefined) {
      this.#cubemaps.delete(texture);
      cubemap.dispose();
    }
  }

  dispose() {
    this.#cubemaps = new WeakMap();
  }
}

export { WebGLCubeMaps };
