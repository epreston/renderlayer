import { ImageUtils } from '@renderlayer/shared';
import { generateUUID } from '@renderlayer/math';

/**
 * @import { Vector2, Vector3 } from '@renderlayer/math';
 */

class Source {
  #id = _sourceId++;

  uuid = generateUUID();
  data = null; // obj or array
  dataReady = true;
  version = 0;

  constructor(data = null) {
    this.data = data; // obj or array
  }

  get isSource() {
    return true;
  }

  get id() {
    return this.#id;
  }

  /**
   * Returns the dimensions of the source into the given target vector.
   *
   * @param {(Vector2 | Vector3)} target - The target object the result is written into.
   * @return {(Vector2 | Vector3)} The dimensions of the source.
   */
  getSize(target) {
    const data = this.data;

    if (typeof HTMLVideoElement !== 'undefined' && data instanceof HTMLVideoElement) {
      target.set(data.videoWidth, data.videoHeight, 0);
    } else if (typeof VideoFrame !== 'undefined' && data instanceof VideoFrame) {
      target.set(data.displayHeight, data.displayWidth, 0);
    } else if (data !== null) {
      target.set(data.width, data.height, data.depth || 0);
    } else {
      target.set(0, 0, 0);
    }

    return target;
  }

  set needsUpdate(value) {
    if (value === true) this.version++;
  }

  toJSON(meta) {
    const isRootObject = meta === undefined || typeof meta === 'string';

    if (!isRootObject && meta.images[this.uuid] !== undefined) {
      return meta.images[this.uuid];
    }

    const output = { uuid: this.uuid, url: '' };
    const data = this.data;

    if (data !== null) {
      let url;

      if (Array.isArray(data)) {
        // cube texture
        url = [];

        for (let i = 0, l = data.length; i < l; i++) {
          if (data[i].isDataTexture) {
            url.push(_serializeImage(data[i].image));
          } else {
            url.push(_serializeImage(data[i]));
          }
        }
      } else {
        // texture
        url = _serializeImage(data);
      }

      output.url = url;
    }

    if (!isRootObject) {
      meta.images[this.uuid] = output;
    }

    return output;
  }
}

let _sourceId = 0;

function _serializeImage(image) {
  if (
    (typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement) ||
    (typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement) ||
    (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap)
  ) {
    // default images

    return ImageUtils.getDataURL(image);
  } else {
    if (image.data) {
      // images of DataTexture

      return {
        data: Array.from(image.data),
        width: image.width,
        height: image.height,
        type: image.data.constructor.name
      };
    } else {
      console.warn('Texture: Unable to serialize Texture.');
      return {};
    }
  }
}

export { Source };
