import { ImageUtils } from '@renderlayer/shared';
import { generateUUID } from '@renderlayer/math';

class Source {
  #id = _sourceId++;

  uuid = generateUUID();
  data; // obj or array
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
