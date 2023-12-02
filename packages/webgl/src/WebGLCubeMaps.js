import {
  CubeReflectionMapping,
  CubeRefractionMapping,
  EquirectangularReflectionMapping,
  EquirectangularRefractionMapping
} from '@renderlayer/shared';
import { WebGLCubeRenderTarget } from '@renderlayer/targets';

class WebGLCubeMaps {
  constructor(renderer) {
    this._renderer = renderer;
    this._cubemaps = new WeakMap();
  }

  _mapTextureMapping(texture, mapping) {
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
        if (this._cubemaps.has(texture)) {
          const cubemap = this._cubemaps.get(texture).texture;
          return this._mapTextureMapping(cubemap, texture.mapping);
        } else {
          const image = texture.image;

          if (image && image.height > 0) {
            const renderTarget = new WebGLCubeRenderTarget(image.height / 2);
            renderTarget.fromEquirectangularTexture(this._renderer, texture);
            this._cubemaps.set(texture, renderTarget);

            texture.addEventListener('dispose', this._onTextureDispose);

            return this._mapTextureMapping(renderTarget.texture, texture.mapping);
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

    const cubemap = this._cubemaps.get(texture);

    if (cubemap !== undefined) {
      this._cubemaps.delete(texture);
      cubemap.dispose();
    }
  }

  dispose() {
    this._cubemaps = new WeakMap();
  }
}

export { WebGLCubeMaps };
