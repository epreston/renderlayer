import { InstancedBufferGeometry, BufferGeometry, BufferAttribute, InterleavedBufferAttribute, InstancedBufferAttribute, InterleavedBuffer } from '@renderlayer/buffers';
import { Vector3, Sphere, Color, Matrix4, Matrix3, Vector4, Vector2 } from '@renderlayer/math';
import { getTypedArray, createElementNS, UVMapping, CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping, CubeUVReflectionMapping, RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping, NearestFilter, NearestMipmapNearestFilter, NearestMipmapLinearFilter, LinearFilter, LinearMipmapNearestFilter, LinearMipmapLinearFilter } from '@renderlayer/shared';
import { ShadowMaterial, SpriteMaterial, RawShaderMaterial, ShaderMaterial, PointsMaterial, MeshPhysicalMaterial, MeshStandardMaterial, MeshNormalMaterial, MeshDepthMaterial, MeshDistanceMaterial, MeshBasicMaterial, LineBasicMaterial, Material } from '@renderlayer/materials';
import { AnimationClip } from '@renderlayer/animation';
import { OrthographicCamera, PerspectiveCamera } from '@renderlayer/cameras';
import { Object3D } from '@renderlayer/core';
import { Scene, Fog, FogExp2 } from '@renderlayer/scenes';
import { DataTexture, Source, CubeTexture, Texture } from '@renderlayer/textures';
import * as Geometries from '@renderlayer/geometries';
import { SpotLight, PointLight, DirectionalLight, AmbientLight } from '@renderlayer/lights';
import { Skeleton, Bone, Group, Sprite, Points, LineSegments, LineLoop, Line, LOD, InstancedMesh, Mesh, SkinnedMesh } from '@renderlayer/objects';

const Cache = {
  enabled: false,
  files: {},
  // EP: use map
  add: function(key, file) {
    if (this.enabled === false)
      return;
    this.files[key] = file;
  },
  get: function(key) {
    if (this.enabled === false)
      return;
    return this.files[key];
  },
  remove: function(key) {
    delete this.files[key];
  },
  clear: function() {
    this.files = {};
  }
};

class LoadingManager {
  constructor(onLoad, onProgress, onError) {
    const scope = this;
    let isLoading = false;
    let itemsLoaded = 0;
    let itemsTotal = 0;
    let urlModifier = void 0;
    const handlers = [];
    this.onStart = void 0;
    this.onLoad = onLoad;
    this.onProgress = onProgress;
    this.onError = onError;
    this.itemStart = function(url) {
      itemsTotal++;
      if (isLoading === false) {
        if (scope.onStart !== void 0) {
          scope.onStart(url, itemsLoaded, itemsTotal);
        }
      }
      isLoading = true;
    };
    this.itemEnd = function(url) {
      itemsLoaded++;
      if (scope.onProgress !== void 0) {
        scope.onProgress(url, itemsLoaded, itemsTotal);
      }
      if (itemsLoaded === itemsTotal) {
        isLoading = false;
        if (scope.onLoad !== void 0) {
          scope.onLoad();
        }
      }
    };
    this.itemError = function(url) {
      if (scope.onError !== void 0) {
        scope.onError(url);
      }
    };
    this.resolveURL = function(url) {
      if (urlModifier) {
        return urlModifier(url);
      }
      return url;
    };
    this.setURLModifier = function(transform) {
      urlModifier = transform;
      return this;
    };
    this.addHandler = function(regex, loader) {
      handlers.push(regex, loader);
      return this;
    };
    this.removeHandler = function(regex) {
      const index = handlers.indexOf(regex);
      if (index !== -1) {
        handlers.splice(index, 2);
      }
      return this;
    };
    this.getHandler = function(file) {
      for (let i = 0, l = handlers.length; i < l; i += 2) {
        const regex = handlers[i];
        const loader = handlers[i + 1];
        if (regex.global)
          regex.lastIndex = 0;
        if (regex.test(file)) {
          return loader;
        }
      }
      return null;
    };
  }
}
const DefaultLoadingManager = /* @__PURE__ */ new LoadingManager();

class Loader {
  constructor(manager) {
    this.manager = manager !== void 0 ? manager : DefaultLoadingManager;
    this.crossOrigin = "anonymous";
    this.withCredentials = false;
    this.path = "";
    this.resourcePath = "";
    this.requestHeader = {};
  }
  load() {
  }
  loadAsync(url, onProgress) {
    const scope = this;
    return new Promise(function(resolve, reject) {
      scope.load(url, resolve, onProgress, reject);
    });
  }
  parse() {
  }
  setCrossOrigin(crossOrigin) {
    this.crossOrigin = crossOrigin;
    return this;
  }
  setWithCredentials(value) {
    this.withCredentials = value;
    return this;
  }
  setPath(path) {
    this.path = path;
    return this;
  }
  setResourcePath(resourcePath) {
    this.resourcePath = resourcePath;
    return this;
  }
  setRequestHeader(requestHeader) {
    this.requestHeader = requestHeader;
    return this;
  }
}

const loading = {};
class HttpError extends Error {
  constructor(message, response) {
    super(message);
    this.response = response;
  }
}
class FileLoader extends Loader {
  constructor(manager) {
    super(manager);
  }
  load(url, onLoad, onProgress, onError) {
    if (url === void 0)
      url = "";
    if (this.path !== void 0)
      url = this.path + url;
    url = this.manager.resolveURL(url);
    const cached = Cache.get(url);
    if (cached !== void 0) {
      this.manager.itemStart(url);
      setTimeout(() => {
        if (onLoad)
          onLoad(cached);
        this.manager.itemEnd(url);
      }, 0);
      return cached;
    }
    if (loading[url] !== void 0) {
      loading[url].push({
        onLoad,
        onProgress,
        onError
      });
      return;
    }
    loading[url] = [];
    loading[url].push({
      onLoad,
      onProgress,
      onError
    });
    const req = new Request(url, {
      headers: new Headers(this.requestHeader),
      credentials: this.withCredentials ? "include" : "same-origin"
      // An abort controller could be added within a future PR
    });
    const mimeType = this.mimeType;
    const responseType = this.responseType;
    fetch(req).then((response) => {
      if (response.status === 200 || response.status === 0) {
        if (response.status === 0) {
          console.warn("FileLoader: HTTP Status 0 received.");
        }
        if (typeof ReadableStream === "undefined" || response.body === void 0 || response.body.getReader === void 0) {
          return response;
        }
        const callbacks = loading[url];
        const reader = response.body.getReader();
        const contentLength = response.headers.get("Content-Length") || response.headers.get("X-File-Size");
        const total = contentLength ? parseInt(contentLength) : 0;
        const lengthComputable = total !== 0;
        let loaded = 0;
        const stream = new ReadableStream({
          start(controller) {
            readData();
            function readData() {
              reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                } else {
                  loaded += value.byteLength;
                  const event = new ProgressEvent("progress", {
                    lengthComputable,
                    loaded,
                    total
                  });
                  for (let i = 0, il = callbacks.length; i < il; i++) {
                    const callback = callbacks[i];
                    if (callback.onProgress)
                      callback.onProgress(event);
                  }
                  controller.enqueue(value);
                  readData();
                }
              });
            }
          }
        });
        return new Response(stream);
      } else {
        throw new HttpError(
          `fetch for "${response.url}" responded with ${response.status}: ${response.statusText}`,
          response
        );
      }
    }).then((response) => {
      switch (responseType) {
        case "arraybuffer":
          return response.arrayBuffer();
        case "blob":
          return response.blob();
        case "document":
          return response.text().then((text) => {
            const parser = new DOMParser();
            return parser.parseFromString(text, mimeType);
          });
        case "json":
          return response.json();
        default:
          if (mimeType === void 0) {
            return response.text();
          } else {
            const re = /charset="?([^;"\s]*)"?/i;
            const exec = re.exec(mimeType);
            const label = exec && exec[1] ? exec[1].toLowerCase() : void 0;
            const decoder = new TextDecoder(label);
            return response.arrayBuffer().then((ab) => decoder.decode(ab));
          }
      }
    }).then((data) => {
      Cache.add(url, data);
      const callbacks = loading[url];
      delete loading[url];
      for (let i = 0, il = callbacks.length; i < il; i++) {
        const callback = callbacks[i];
        if (callback.onLoad)
          callback.onLoad(data);
      }
    }).catch((err) => {
      const callbacks = loading[url];
      if (callbacks === void 0) {
        this.manager.itemError(url);
        throw err;
      }
      delete loading[url];
      for (let i = 0, il = callbacks.length; i < il; i++) {
        const callback = callbacks[i];
        if (callback.onError)
          callback.onError(err);
      }
      this.manager.itemError(url);
    }).finally(() => {
      this.manager.itemEnd(url);
    });
    this.manager.itemStart(url);
  }
  setResponseType(value) {
    this.responseType = value;
    return this;
  }
  setMimeType(value) {
    this.mimeType = value;
    return this;
  }
}

class BufferGeometryLoader extends Loader {
  constructor(manager) {
    super(manager);
  }
  load(url, onLoad, onProgress, onError) {
    const scope = this;
    const loader = new FileLoader(scope.manager);
    loader.setPath(scope.path);
    loader.setRequestHeader(scope.requestHeader);
    loader.setWithCredentials(scope.withCredentials);
    loader.load(
      url,
      function(text) {
        try {
          onLoad(scope.parse(JSON.parse(text)));
        } catch (e) {
          if (onError) {
            onError(e);
          } else {
            console.error(e);
          }
          scope.manager.itemError(url);
        }
      },
      onProgress,
      onError
    );
  }
  parse(json) {
    const interleavedBufferMap = {};
    const arrayBufferMap = {};
    function getInterleavedBuffer(json2, uuid) {
      if (interleavedBufferMap[uuid] !== void 0)
        return interleavedBufferMap[uuid];
      const interleavedBuffers = json2.interleavedBuffers;
      const interleavedBuffer = interleavedBuffers[uuid];
      const buffer = getArrayBuffer(json2, interleavedBuffer.buffer);
      const array = getTypedArray(interleavedBuffer.type, buffer);
      const ib = new InterleavedBuffer(array, interleavedBuffer.stride);
      ib.uuid = interleavedBuffer.uuid;
      interleavedBufferMap[uuid] = ib;
      return ib;
    }
    function getArrayBuffer(json2, uuid) {
      if (arrayBufferMap[uuid] !== void 0)
        return arrayBufferMap[uuid];
      const arrayBuffers = json2.arrayBuffers;
      const arrayBuffer = arrayBuffers[uuid];
      const ab = new Uint32Array(arrayBuffer).buffer;
      arrayBufferMap[uuid] = ab;
      return ab;
    }
    const geometry = json.isInstancedBufferGeometry ? new InstancedBufferGeometry() : new BufferGeometry();
    const index = json.data.index;
    if (index !== void 0) {
      const typedArray = getTypedArray(index.type, index.array);
      geometry.setIndex(new BufferAttribute(typedArray, 1));
    }
    const attributes = json.data.attributes;
    for (const key in attributes) {
      const attribute = attributes[key];
      let bufferAttribute;
      if (attribute.isInterleavedBufferAttribute) {
        const interleavedBuffer = getInterleavedBuffer(json.data, attribute.data);
        bufferAttribute = new InterleavedBufferAttribute(
          interleavedBuffer,
          attribute.itemSize,
          attribute.offset,
          attribute.normalized
        );
      } else {
        const typedArray = getTypedArray(attribute.type, attribute.array);
        const bufferAttributeConstr = attribute.isInstancedBufferAttribute ? InstancedBufferAttribute : BufferAttribute;
        bufferAttribute = new bufferAttributeConstr(
          typedArray,
          attribute.itemSize,
          attribute.normalized
        );
      }
      if (attribute.name !== void 0)
        bufferAttribute.name = attribute.name;
      if (attribute.usage !== void 0)
        bufferAttribute.setUsage(attribute.usage);
      if (attribute.updateRange !== void 0) {
        bufferAttribute.updateRange.offset = attribute.updateRange.offset;
        bufferAttribute.updateRange.count = attribute.updateRange.count;
      }
      geometry.setAttribute(key, bufferAttribute);
    }
    const morphAttributes = json.data.morphAttributes;
    if (morphAttributes) {
      for (const key in morphAttributes) {
        const attributeArray = morphAttributes[key];
        const array = [];
        for (let i = 0, il = attributeArray.length; i < il; i++) {
          const attribute = attributeArray[i];
          let bufferAttribute;
          if (attribute.isInterleavedBufferAttribute) {
            const interleavedBuffer = getInterleavedBuffer(json.data, attribute.data);
            bufferAttribute = new InterleavedBufferAttribute(
              interleavedBuffer,
              attribute.itemSize,
              attribute.offset,
              attribute.normalized
            );
          } else {
            const typedArray = getTypedArray(attribute.type, attribute.array);
            bufferAttribute = new BufferAttribute(
              typedArray,
              attribute.itemSize,
              attribute.normalized
            );
          }
          if (attribute.name !== void 0)
            bufferAttribute.name = attribute.name;
          array.push(bufferAttribute);
        }
        geometry.morphAttributes[key] = array;
      }
    }
    const morphTargetsRelative = json.data.morphTargetsRelative;
    if (morphTargetsRelative) {
      geometry.morphTargetsRelative = true;
    }
    const groups = json.data.groups || json.data.drawcalls || json.data.offsets;
    if (groups !== void 0) {
      for (let i = 0, n = groups.length; i !== n; ++i) {
        const group = groups[i];
        geometry.addGroup(group.start, group.count, group.materialIndex);
      }
    }
    const boundingSphere = json.data.boundingSphere;
    if (boundingSphere !== void 0) {
      const center = new Vector3();
      if (boundingSphere.center !== void 0) {
        center.fromArray(boundingSphere.center);
      }
      geometry.boundingSphere = new Sphere(center, boundingSphere.radius);
    }
    if (json.name)
      geometry.name = json.name;
    if (json.userData)
      geometry.userData = json.userData;
    return geometry;
  }
}

class ImageBitmapLoader extends Loader {
  constructor(manager) {
    super(manager);
    this.isImageBitmapLoader = true;
    if (typeof createImageBitmap === "undefined") {
      console.warn("ImageBitmapLoader: createImageBitmap() not supported.");
    }
    this.options = { premultiplyAlpha: "none" };
  }
  setOptions(options) {
    this.options = options;
    return this;
  }
  load(url, onLoad, onProgress, onError) {
    if (url === void 0)
      url = "";
    if (this.path !== void 0)
      url = this.path + url;
    url = this.manager.resolveURL(url);
    const scope = this;
    const cached = Cache.get(url);
    if (cached !== void 0) {
      scope.manager.itemStart(url);
      setTimeout(function() {
        if (onLoad)
          onLoad(cached);
        scope.manager.itemEnd(url);
      }, 0);
      return cached;
    }
    const fetchOptions = {};
    fetchOptions.credentials = this.crossOrigin === "anonymous" ? "same-origin" : "include";
    fetchOptions.headers = this.requestHeader;
    fetch(url, fetchOptions).then(function(res) {
      return res.blob();
    }).then(function(blob) {
      return createImageBitmap(
        blob,
        Object.assign(scope.options, { colorSpaceConversion: "none" })
      );
    }).then(function(imageBitmap) {
      Cache.add(url, imageBitmap);
      if (onLoad)
        onLoad(imageBitmap);
      scope.manager.itemEnd(url);
    }).catch(function(e) {
      if (onError)
        onError(e);
      scope.manager.itemError(url);
      scope.manager.itemEnd(url);
    });
    scope.manager.itemStart(url);
  }
}

class ImageLoader extends Loader {
  constructor(manager) {
    super(manager);
  }
  load(url, onLoad, onProgress, onError) {
    if (this.path !== void 0)
      url = this.path + url;
    url = this.manager.resolveURL(url);
    const scope = this;
    const cached = Cache.get(url);
    if (cached !== void 0) {
      scope.manager.itemStart(url);
      setTimeout(function() {
        if (onLoad)
          onLoad(cached);
        scope.manager.itemEnd(url);
      }, 0);
      return cached;
    }
    const image = createElementNS("img");
    function onImageLoad() {
      removeEventListeners();
      Cache.add(url, this);
      if (onLoad)
        onLoad(this);
      scope.manager.itemEnd(url);
    }
    function onImageError(event) {
      removeEventListeners();
      if (onError)
        onError(event);
      scope.manager.itemError(url);
      scope.manager.itemEnd(url);
    }
    function removeEventListeners() {
      image.removeEventListener("load", onImageLoad, false);
      image.removeEventListener("error", onImageError, false);
    }
    image.addEventListener("load", onImageLoad, false);
    image.addEventListener("error", onImageError, false);
    if (url.slice(0, 5) !== "data:") {
      if (this.crossOrigin !== void 0)
        image.crossOrigin = this.crossOrigin;
    }
    scope.manager.itemStart(url);
    image.src = url;
    return image;
  }
}

class LoaderUtils {
  static decodeText(array) {
    if (typeof TextDecoder !== "undefined") {
      return new TextDecoder().decode(array);
    }
    let s = "";
    for (let i = 0, il = array.length; i < il; i++) {
      s += String.fromCharCode(array[i]);
    }
    try {
      return decodeURIComponent(escape(s));
    } catch (e) {
      return s;
    }
  }
  static extractUrlBase(url) {
    const index = url.lastIndexOf("/");
    if (index === -1)
      return "./";
    return url.slice(0, index + 1);
  }
  static resolveURL(url, path) {
    if (typeof url !== "string" || url === "")
      return "";
    if (/^https?:\/\//i.test(path) && /^\//.test(url)) {
      path = path.replace(/(^https?:\/\/[^/]+).*/i, "$1");
    }
    if (/^(https?:)?\/\//i.test(url))
      return url;
    if (/^data:.*,.*$/i.test(url))
      return url;
    if (/^blob:.*$/i.test(url))
      return url;
    if (/^file:.*$/i.test(url))
      return url;
    if (!path) {
      path = document.baseURI || window.location.href;
    }
    try {
      return new URL(url, path).href;
    } catch (e) {
      return "";
    }
  }
  static withTrailingSlash(path) {
    if (path[path.length - 1] !== "/") {
      return `${path}/`;
    }
    return path;
  }
}

class MaterialLoader extends Loader {
  constructor(manager) {
    super(manager);
    this.textures = {};
  }
  load(url, onLoad, onProgress, onError) {
    const scope = this;
    const loader = new FileLoader(scope.manager);
    loader.setPath(scope.path);
    loader.setRequestHeader(scope.requestHeader);
    loader.setWithCredentials(scope.withCredentials);
    loader.load(
      url,
      function(text) {
        try {
          onLoad(scope.parse(JSON.parse(text)));
        } catch (e) {
          if (onError) {
            onError(e);
          } else {
            console.error(e);
          }
          scope.manager.itemError(url);
        }
      },
      onProgress,
      onError
    );
  }
  parse(json) {
    const textures = this.textures;
    function getTexture(name) {
      if (textures[name] === void 0) {
        console.warn("MaterialLoader: Undefined texture", name);
      }
      return textures[name];
    }
    const material = MaterialLoader.createMaterialFromType(json.type);
    if (json.uuid !== void 0)
      material.uuid = json.uuid;
    if (json.name !== void 0)
      material.name = json.name;
    if (json.color !== void 0 && material.color !== void 0)
      material.color.setHex(json.color);
    if (json.roughness !== void 0)
      material.roughness = json.roughness;
    if (json.metalness !== void 0)
      material.metalness = json.metalness;
    if (json.sheen !== void 0)
      material.sheen = json.sheen;
    if (json.sheenColor !== void 0)
      material.sheenColor = new Color().setHex(json.sheenColor);
    if (json.sheenRoughness !== void 0)
      material.sheenRoughness = json.sheenRoughness;
    if (json.emissive !== void 0 && material.emissive !== void 0)
      material.emissive.setHex(json.emissive);
    if (json.specular !== void 0 && material.specular !== void 0)
      material.specular.setHex(json.specular);
    if (json.specularIntensity !== void 0)
      material.specularIntensity = json.specularIntensity;
    if (json.specularColor !== void 0 && material.specularColor !== void 0)
      material.specularColor.setHex(json.specularColor);
    if (json.shininess !== void 0)
      material.shininess = json.shininess;
    if (json.clearcoat !== void 0)
      material.clearcoat = json.clearcoat;
    if (json.clearcoatRoughness !== void 0)
      material.clearcoatRoughness = json.clearcoatRoughness;
    if (json.iridescence !== void 0)
      material.iridescence = json.iridescence;
    if (json.iridescenceIOR !== void 0)
      material.iridescenceIOR = json.iridescenceIOR;
    if (json.iridescenceThicknessRange !== void 0)
      material.iridescenceThicknessRange = json.iridescenceThicknessRange;
    if (json.transmission !== void 0)
      material.transmission = json.transmission;
    if (json.thickness !== void 0)
      material.thickness = json.thickness;
    if (json.attenuationDistance !== void 0)
      material.attenuationDistance = json.attenuationDistance;
    if (json.attenuationColor !== void 0 && material.attenuationColor !== void 0)
      material.attenuationColor.setHex(json.attenuationColor);
    if (json.fog !== void 0)
      material.fog = json.fog;
    if (json.flatShading !== void 0)
      material.flatShading = json.flatShading;
    if (json.blending !== void 0)
      material.blending = json.blending;
    if (json.combine !== void 0)
      material.combine = json.combine;
    if (json.side !== void 0)
      material.side = json.side;
    if (json.shadowSide !== void 0)
      material.shadowSide = json.shadowSide;
    if (json.opacity !== void 0)
      material.opacity = json.opacity;
    if (json.transparent !== void 0)
      material.transparent = json.transparent;
    if (json.alphaTest !== void 0)
      material.alphaTest = json.alphaTest;
    if (json.depthTest !== void 0)
      material.depthTest = json.depthTest;
    if (json.depthWrite !== void 0)
      material.depthWrite = json.depthWrite;
    if (json.colorWrite !== void 0)
      material.colorWrite = json.colorWrite;
    if (json.stencilWrite !== void 0)
      material.stencilWrite = json.stencilWrite;
    if (json.stencilWriteMask !== void 0)
      material.stencilWriteMask = json.stencilWriteMask;
    if (json.stencilFunc !== void 0)
      material.stencilFunc = json.stencilFunc;
    if (json.stencilRef !== void 0)
      material.stencilRef = json.stencilRef;
    if (json.stencilFuncMask !== void 0)
      material.stencilFuncMask = json.stencilFuncMask;
    if (json.stencilFail !== void 0)
      material.stencilFail = json.stencilFail;
    if (json.stencilZFail !== void 0)
      material.stencilZFail = json.stencilZFail;
    if (json.stencilZPass !== void 0)
      material.stencilZPass = json.stencilZPass;
    if (json.wireframe !== void 0)
      material.wireframe = json.wireframe;
    if (json.wireframeLinewidth !== void 0)
      material.wireframeLinewidth = json.wireframeLinewidth;
    if (json.rotation !== void 0)
      material.rotation = json.rotation;
    if (json.linewidth !== void 0 && json.linewidth !== 1)
      material.linewidth = json.linewidth;
    if (json.dashSize !== void 0)
      material.dashSize = json.dashSize;
    if (json.gapSize !== void 0)
      material.gapSize = json.gapSize;
    if (json.scale !== void 0)
      material.scale = json.scale;
    if (json.polygonOffset !== void 0)
      material.polygonOffset = json.polygonOffset;
    if (json.polygonOffsetFactor !== void 0)
      material.polygonOffsetFactor = json.polygonOffsetFactor;
    if (json.polygonOffsetUnits !== void 0)
      material.polygonOffsetUnits = json.polygonOffsetUnits;
    if (json.dithering !== void 0)
      material.dithering = json.dithering;
    if (json.alphaToCoverage !== void 0)
      material.alphaToCoverage = json.alphaToCoverage;
    if (json.premultipliedAlpha !== void 0)
      material.premultipliedAlpha = json.premultipliedAlpha;
    if (json.forceSinglePass !== void 0)
      material.forceSinglePass = json.forceSinglePass;
    if (json.visible !== void 0)
      material.visible = json.visible;
    if (json.toneMapped !== void 0)
      material.toneMapped = json.toneMapped;
    if (json.userData !== void 0)
      material.userData = json.userData;
    if (json.vertexColors !== void 0) {
      if (typeof json.vertexColors === "number") {
        material.vertexColors = json.vertexColors > 0 ? true : false;
      } else {
        material.vertexColors = json.vertexColors;
      }
    }
    if (json.uniforms !== void 0) {
      for (const name in json.uniforms) {
        const uniform = json.uniforms[name];
        material.uniforms[name] = {};
        switch (uniform.type) {
          case "t":
            material.uniforms[name].value = getTexture(uniform.value);
            break;
          case "c":
            material.uniforms[name].value = new Color().setHex(uniform.value);
            break;
          case "v2":
            material.uniforms[name].value = new Vector2().fromArray(uniform.value);
            break;
          case "v3":
            material.uniforms[name].value = new Vector3().fromArray(uniform.value);
            break;
          case "v4":
            material.uniforms[name].value = new Vector4().fromArray(uniform.value);
            break;
          case "m3":
            material.uniforms[name].value = new Matrix3().fromArray(uniform.value);
            break;
          case "m4":
            material.uniforms[name].value = new Matrix4().fromArray(uniform.value);
            break;
          default:
            material.uniforms[name].value = uniform.value;
        }
      }
    }
    if (json.defines !== void 0)
      material.defines = json.defines;
    if (json.vertexShader !== void 0)
      material.vertexShader = json.vertexShader;
    if (json.fragmentShader !== void 0)
      material.fragmentShader = json.fragmentShader;
    if (json.glslVersion !== void 0)
      material.glslVersion = json.glslVersion;
    if (json.extensions !== void 0) {
      for (const key in json.extensions) {
        material.extensions[key] = json.extensions[key];
      }
    }
    if (json.lights !== void 0)
      material.lights = json.lights;
    if (json.clipping !== void 0)
      material.clipping = json.clipping;
    if (json.size !== void 0)
      material.size = json.size;
    if (json.sizeAttenuation !== void 0)
      material.sizeAttenuation = json.sizeAttenuation;
    if (json.map !== void 0)
      material.map = getTexture(json.map);
    if (json.matcap !== void 0)
      material.matcap = getTexture(json.matcap);
    if (json.alphaMap !== void 0)
      material.alphaMap = getTexture(json.alphaMap);
    if (json.bumpMap !== void 0)
      material.bumpMap = getTexture(json.bumpMap);
    if (json.bumpScale !== void 0)
      material.bumpScale = json.bumpScale;
    if (json.normalMap !== void 0)
      material.normalMap = getTexture(json.normalMap);
    if (json.normalMapType !== void 0)
      material.normalMapType = json.normalMapType;
    if (json.normalScale !== void 0) {
      let normalScale = json.normalScale;
      if (Array.isArray(normalScale) === false) {
        normalScale = [normalScale, normalScale];
      }
      material.normalScale = new Vector2().fromArray(normalScale);
    }
    if (json.displacementMap !== void 0)
      material.displacementMap = getTexture(json.displacementMap);
    if (json.displacementScale !== void 0)
      material.displacementScale = json.displacementScale;
    if (json.displacementBias !== void 0)
      material.displacementBias = json.displacementBias;
    if (json.roughnessMap !== void 0)
      material.roughnessMap = getTexture(json.roughnessMap);
    if (json.metalnessMap !== void 0)
      material.metalnessMap = getTexture(json.metalnessMap);
    if (json.emissiveMap !== void 0)
      material.emissiveMap = getTexture(json.emissiveMap);
    if (json.emissiveIntensity !== void 0)
      material.emissiveIntensity = json.emissiveIntensity;
    if (json.specularMap !== void 0)
      material.specularMap = getTexture(json.specularMap);
    if (json.specularIntensityMap !== void 0)
      material.specularIntensityMap = getTexture(json.specularIntensityMap);
    if (json.specularColorMap !== void 0)
      material.specularColorMap = getTexture(json.specularColorMap);
    if (json.envMap !== void 0)
      material.envMap = getTexture(json.envMap);
    if (json.envMapIntensity !== void 0)
      material.envMapIntensity = json.envMapIntensity;
    if (json.reflectivity !== void 0)
      material.reflectivity = json.reflectivity;
    if (json.refractionRatio !== void 0)
      material.refractionRatio = json.refractionRatio;
    if (json.lightMap !== void 0)
      material.lightMap = getTexture(json.lightMap);
    if (json.lightMapIntensity !== void 0)
      material.lightMapIntensity = json.lightMapIntensity;
    if (json.aoMap !== void 0)
      material.aoMap = getTexture(json.aoMap);
    if (json.aoMapIntensity !== void 0)
      material.aoMapIntensity = json.aoMapIntensity;
    if (json.gradientMap !== void 0)
      material.gradientMap = getTexture(json.gradientMap);
    if (json.clearcoatMap !== void 0)
      material.clearcoatMap = getTexture(json.clearcoatMap);
    if (json.clearcoatRoughnessMap !== void 0)
      material.clearcoatRoughnessMap = getTexture(json.clearcoatRoughnessMap);
    if (json.clearcoatNormalMap !== void 0)
      material.clearcoatNormalMap = getTexture(json.clearcoatNormalMap);
    if (json.clearcoatNormalScale !== void 0)
      material.clearcoatNormalScale = new Vector2().fromArray(json.clearcoatNormalScale);
    if (json.iridescenceMap !== void 0)
      material.iridescenceMap = getTexture(json.iridescenceMap);
    if (json.iridescenceThicknessMap !== void 0)
      material.iridescenceThicknessMap = getTexture(json.iridescenceThicknessMap);
    if (json.transmissionMap !== void 0)
      material.transmissionMap = getTexture(json.transmissionMap);
    if (json.thicknessMap !== void 0)
      material.thicknessMap = getTexture(json.thicknessMap);
    if (json.sheenColorMap !== void 0)
      material.sheenColorMap = getTexture(json.sheenColorMap);
    if (json.sheenRoughnessMap !== void 0)
      material.sheenRoughnessMap = getTexture(json.sheenRoughnessMap);
    return material;
  }
  setTextures(value) {
    this.textures = value;
    return this;
  }
  static createMaterialFromType(type) {
    const materialLib = {
      ShadowMaterial,
      SpriteMaterial,
      RawShaderMaterial,
      ShaderMaterial,
      PointsMaterial,
      MeshPhysicalMaterial,
      MeshStandardMaterial,
      // MeshPhongMaterial,
      // MeshToonMaterial,
      MeshNormalMaterial,
      // MeshLambertMaterial,
      MeshDepthMaterial,
      MeshDistanceMaterial,
      MeshBasicMaterial,
      // MeshMatcapMaterial,
      // LineDashedMaterial,
      LineBasicMaterial,
      Material
    };
    return new materialLib[type]();
  }
}

class ObjectLoader extends Loader {
  constructor(manager) {
    super(manager);
  }
  load(url, onLoad, onProgress, onError) {
    const scope = this;
    const path = this.path === "" ? LoaderUtils.extractUrlBase(url) : this.path;
    this.resourcePath = this.resourcePath || path;
    const loader = new FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);
    loader.load(
      url,
      function(text) {
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (error) {
          if (onError !== void 0)
            onError(error);
          console.error("ObjectLoader: Can't parse " + url + ".", error.message);
          return;
        }
        const metadata = json.metadata;
        if (metadata === void 0 || metadata.type === void 0 || metadata.type.toLowerCase() === "geometry") {
          if (onError !== void 0)
            onError(new Error("ObjectLoader: Can't load " + url));
          console.error("ObjectLoader: Can't load " + url);
          return;
        }
        scope.parse(json, onLoad);
      },
      onProgress,
      onError
    );
  }
  async loadAsync(url, onProgress) {
    const scope = this;
    const path = this.path === "" ? LoaderUtils.extractUrlBase(url) : this.path;
    this.resourcePath = this.resourcePath || path;
    const loader = new FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);
    const text = await loader.loadAsync(url, onProgress);
    const json = JSON.parse(text);
    const metadata = json.metadata;
    if (metadata === void 0 || metadata.type === void 0 || metadata.type.toLowerCase() === "geometry") {
      throw new Error("ObjectLoader: Can't load " + url);
    }
    return await scope.parseAsync(json);
  }
  parse(json, onLoad) {
    const animations = this.parseAnimations(json.animations);
    const shapes = {};
    const geometries = this.parseGeometries(json.geometries, shapes);
    const images = this.parseImages(json.images, function() {
      if (onLoad !== void 0)
        onLoad(object);
    });
    const textures = this.parseTextures(json.textures, images);
    const materials = this.parseMaterials(json.materials, textures);
    const object = this.parseObject(json.object, geometries, materials, textures, animations);
    const skeletons = this.parseSkeletons(json.skeletons, object);
    this.bindSkeletons(object, skeletons);
    if (onLoad !== void 0) {
      let hasImages = false;
      for (const uuid in images) {
        if (images[uuid].data instanceof HTMLImageElement) {
          hasImages = true;
          break;
        }
      }
      if (hasImages === false)
        onLoad(object);
    }
    return object;
  }
  async parseAsync(json) {
    const animations = this.parseAnimations(json.animations);
    const shapes = {};
    const geometries = this.parseGeometries(json.geometries, shapes);
    const images = await this.parseImagesAsync(json.images);
    const textures = this.parseTextures(json.textures, images);
    const materials = this.parseMaterials(json.materials, textures);
    const object = this.parseObject(json.object, geometries, materials, textures, animations);
    const skeletons = this.parseSkeletons(json.skeletons, object);
    this.bindSkeletons(object, skeletons);
    return object;
  }
  // parseShapes(json) {
  //   const shapes = {};
  //   if (json !== undefined) {
  //     for (let i = 0, l = json.length; i < l; i++) {
  //       const shape = new Shape().fromJSON(json[i]);
  //       shapes[shape.uuid] = shape;
  //     }
  //   }
  //   return shapes;
  // }
  parseSkeletons(json, object) {
    const skeletons = {};
    const bones = {};
    object.traverse(function(child) {
      if (child.isBone)
        bones[child.uuid] = child;
    });
    if (json !== void 0) {
      for (let i = 0, l = json.length; i < l; i++) {
        const skeleton = new Skeleton().fromJSON(json[i], bones);
        skeletons[skeleton.uuid] = skeleton;
      }
    }
    return skeletons;
  }
  parseGeometries(json, shapes) {
    const geometries = {};
    if (json !== void 0) {
      const bufferGeometryLoader = new BufferGeometryLoader();
      for (let i = 0, l = json.length; i < l; i++) {
        let geometry;
        const data = json[i];
        switch (data.type) {
          case "BufferGeometry":
          case "InstancedBufferGeometry":
            geometry = bufferGeometryLoader.parse(data);
            break;
          default:
            if (data.type in Geometries) {
              geometry = Geometries[data.type].fromJSON(data, shapes);
            } else {
              console.warn(`ObjectLoader: Unsupported geometry type "${data.type}"`);
            }
        }
        geometry.uuid = data.uuid;
        if (data.name !== void 0)
          geometry.name = data.name;
        if (data.userData !== void 0)
          geometry.userData = data.userData;
        geometries[data.uuid] = geometry;
      }
    }
    return geometries;
  }
  parseMaterials(json, textures) {
    const cache = {};
    const materials = {};
    if (json !== void 0) {
      const loader = new MaterialLoader();
      loader.setTextures(textures);
      for (let i = 0, l = json.length; i < l; i++) {
        const data = json[i];
        if (cache[data.uuid] === void 0) {
          cache[data.uuid] = loader.parse(data);
        }
        materials[data.uuid] = cache[data.uuid];
      }
    }
    return materials;
  }
  parseAnimations(json) {
    const animations = {};
    if (json !== void 0) {
      for (let i = 0; i < json.length; i++) {
        const data = json[i];
        const clip = AnimationClip.parse(data);
        animations[clip.uuid] = clip;
      }
    }
    return animations;
  }
  parseImages(json, onLoad) {
    const scope = this;
    const images = {};
    let loader;
    function loadImage(url) {
      scope.manager.itemStart(url);
      return loader.load(
        url,
        function() {
          scope.manager.itemEnd(url);
        },
        void 0,
        function() {
          scope.manager.itemError(url);
          scope.manager.itemEnd(url);
        }
      );
    }
    function deserializeImage(image) {
      if (typeof image === "string") {
        const url = image;
        const path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test(url) ? url : scope.resourcePath + url;
        return loadImage(path);
      } else {
        if (image.data) {
          return {
            data: getTypedArray(image.type, image.data),
            width: image.width,
            height: image.height
          };
        } else {
          return null;
        }
      }
    }
    if (json !== void 0 && json.length > 0) {
      const manager = new LoadingManager(onLoad);
      loader = new ImageLoader(manager);
      loader.setCrossOrigin(this.crossOrigin);
      for (let i = 0, il = json.length; i < il; i++) {
        const image = json[i];
        const url = image.url;
        if (Array.isArray(url)) {
          const imageArray = [];
          for (let j = 0, jl = url.length; j < jl; j++) {
            const currentUrl = url[j];
            const deserializedImage = deserializeImage(currentUrl);
            if (deserializedImage !== null) {
              if (deserializedImage instanceof HTMLImageElement) {
                imageArray.push(deserializedImage);
              } else {
                imageArray.push(
                  new DataTexture(
                    deserializedImage.data,
                    deserializedImage.width,
                    deserializedImage.height
                  )
                );
              }
            }
          }
          images[image.uuid] = new Source(imageArray);
        } else {
          const deserializedImage = deserializeImage(image.url);
          images[image.uuid] = new Source(deserializedImage);
        }
      }
    }
    return images;
  }
  async parseImagesAsync(json) {
    const scope = this;
    const images = {};
    let loader;
    async function deserializeImage(image) {
      if (typeof image === "string") {
        const url = image;
        const path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test(url) ? url : scope.resourcePath + url;
        return await loader.loadAsync(path);
      } else {
        if (image.data) {
          return {
            data: getTypedArray(image.type, image.data),
            width: image.width,
            height: image.height
          };
        } else {
          return null;
        }
      }
    }
    if (json !== void 0 && json.length > 0) {
      loader = new ImageLoader(this.manager);
      loader.setCrossOrigin(this.crossOrigin);
      for (let i = 0, il = json.length; i < il; i++) {
        const image = json[i];
        const url = image.url;
        if (Array.isArray(url)) {
          const imageArray = [];
          for (let j = 0, jl = url.length; j < jl; j++) {
            const currentUrl = url[j];
            const deserializedImage = await deserializeImage(currentUrl);
            if (deserializedImage !== null) {
              if (deserializedImage instanceof HTMLImageElement) {
                imageArray.push(deserializedImage);
              } else {
                imageArray.push(
                  new DataTexture(
                    deserializedImage.data,
                    deserializedImage.width,
                    deserializedImage.height
                  )
                );
              }
            }
          }
          images[image.uuid] = new Source(imageArray);
        } else {
          const deserializedImage = await deserializeImage(image.url);
          images[image.uuid] = new Source(deserializedImage);
        }
      }
    }
    return images;
  }
  parseTextures(json, images) {
    function parseConstant(value, type) {
      if (typeof value === "number")
        return value;
      console.warn("ObjectLoader.parseTexture: Constant should be in numeric form.", value);
      return type[value];
    }
    const textures = {};
    if (json !== void 0) {
      for (let i = 0, l = json.length; i < l; i++) {
        const data = json[i];
        if (data.image === void 0) {
          console.warn('ObjectLoader: No "image" specified for', data.uuid);
        }
        if (images[data.image] === void 0) {
          console.warn("ObjectLoader: Undefined image", data.image);
        }
        const source = images[data.image];
        const image = source.data;
        let texture;
        if (Array.isArray(image)) {
          texture = new CubeTexture();
          if (image.length === 6)
            texture.needsUpdate = true;
        } else {
          if (image && image.data) {
            texture = new DataTexture();
          } else {
            texture = new Texture();
          }
          if (image)
            texture.needsUpdate = true;
        }
        texture.source = source;
        texture.uuid = data.uuid;
        if (data.name !== void 0)
          texture.name = data.name;
        if (data.mapping !== void 0)
          texture.mapping = parseConstant(data.mapping, TEXTURE_MAPPING);
        if (data.channel !== void 0)
          texture.channel = data.channel;
        if (data.offset !== void 0)
          texture.offset.fromArray(data.offset);
        if (data.repeat !== void 0)
          texture.repeat.fromArray(data.repeat);
        if (data.center !== void 0)
          texture.center.fromArray(data.center);
        if (data.rotation !== void 0)
          texture.rotation = data.rotation;
        if (data.wrap !== void 0) {
          texture.wrapS = parseConstant(data.wrap[0], TEXTURE_WRAPPING);
          texture.wrapT = parseConstant(data.wrap[1], TEXTURE_WRAPPING);
        }
        if (data.format !== void 0)
          texture.format = data.format;
        if (data.internalFormat !== void 0)
          texture.internalFormat = data.internalFormat;
        if (data.type !== void 0)
          texture.type = data.type;
        if (data.colorSpace !== void 0)
          texture.colorSpace = data.colorSpace;
        if (data.encoding !== void 0)
          texture.encoding = data.encoding;
        if (data.minFilter !== void 0)
          texture.minFilter = parseConstant(data.minFilter, TEXTURE_FILTER);
        if (data.magFilter !== void 0)
          texture.magFilter = parseConstant(data.magFilter, TEXTURE_FILTER);
        if (data.anisotropy !== void 0)
          texture.anisotropy = data.anisotropy;
        if (data.flipY !== void 0)
          texture.flipY = data.flipY;
        if (data.generateMipmaps !== void 0)
          texture.generateMipmaps = data.generateMipmaps;
        if (data.premultiplyAlpha !== void 0)
          texture.premultiplyAlpha = data.premultiplyAlpha;
        if (data.unpackAlignment !== void 0)
          texture.unpackAlignment = data.unpackAlignment;
        if (data.userData !== void 0)
          texture.userData = data.userData;
        textures[data.uuid] = texture;
      }
    }
    return textures;
  }
  parseObject(data, geometries, materials, textures, animations) {
    let object;
    function getGeometry(name) {
      if (geometries[name] === void 0) {
        console.warn("ObjectLoader: Undefined geometry", name);
      }
      return geometries[name];
    }
    function getMaterial(name) {
      if (name === void 0)
        return void 0;
      if (Array.isArray(name)) {
        const array = [];
        for (let i = 0, l = name.length; i < l; i++) {
          const uuid = name[i];
          if (materials[uuid] === void 0) {
            console.warn("ObjectLoader: Undefined material", uuid);
          }
          array.push(materials[uuid]);
        }
        return array;
      }
      if (materials[name] === void 0) {
        console.warn("ObjectLoader: Undefined material", name);
      }
      return materials[name];
    }
    function getTexture(uuid) {
      if (textures[uuid] === void 0) {
        console.warn("ObjectLoader: Undefined texture", uuid);
      }
      return textures[uuid];
    }
    let geometry, material;
    switch (data.type) {
      case "Scene":
        object = new Scene();
        if (data.background !== void 0) {
          if (Number.isInteger(data.background)) {
            object.background = new Color(data.background);
          } else {
            object.background = getTexture(data.background);
          }
        }
        if (data.environment !== void 0) {
          object.environment = getTexture(data.environment);
        }
        if (data.fog !== void 0) {
          if (data.fog.type === "Fog") {
            object.fog = new Fog(data.fog.color, data.fog.near, data.fog.far);
          } else if (data.fog.type === "FogExp2") {
            object.fog = new FogExp2(data.fog.color, data.fog.density);
          }
        }
        if (data.backgroundBlurriness !== void 0)
          object.backgroundBlurriness = data.backgroundBlurriness;
        if (data.backgroundIntensity !== void 0)
          object.backgroundIntensity = data.backgroundIntensity;
        break;
      case "PerspectiveCamera":
        object = new PerspectiveCamera(data.fov, data.aspect, data.near, data.far);
        if (data.focus !== void 0)
          object.focus = data.focus;
        if (data.zoom !== void 0)
          object.zoom = data.zoom;
        if (data.filmGauge !== void 0)
          object.filmGauge = data.filmGauge;
        if (data.filmOffset !== void 0)
          object.filmOffset = data.filmOffset;
        if (data.view !== void 0)
          object.view = Object.assign({}, data.view);
        break;
      case "OrthographicCamera":
        object = new OrthographicCamera(
          data.left,
          data.right,
          data.top,
          data.bottom,
          data.near,
          data.far
        );
        if (data.zoom !== void 0)
          object.zoom = data.zoom;
        if (data.view !== void 0)
          object.view = Object.assign({}, data.view);
        break;
      case "AmbientLight":
        object = new AmbientLight(data.color, data.intensity);
        break;
      case "DirectionalLight":
        object = new DirectionalLight(data.color, data.intensity);
        break;
      case "PointLight":
        object = new PointLight(data.color, data.intensity, data.distance, data.decay);
        break;
      case "SpotLight":
        object = new SpotLight(
          data.color,
          data.intensity,
          data.distance,
          data.angle,
          data.penumbra,
          data.decay
        );
        break;
      case "SkinnedMesh":
        geometry = getGeometry(data.geometry);
        material = getMaterial(data.material);
        object = new SkinnedMesh(geometry, material);
        if (data.bindMode !== void 0)
          object.bindMode = data.bindMode;
        if (data.bindMatrix !== void 0)
          object.bindMatrix.fromArray(data.bindMatrix);
        if (data.skeleton !== void 0)
          object.skeleton = data.skeleton;
        break;
      case "Mesh":
        geometry = getGeometry(data.geometry);
        material = getMaterial(data.material);
        object = new Mesh(geometry, material);
        break;
      case "InstancedMesh": {
        geometry = getGeometry(data.geometry);
        material = getMaterial(data.material);
        const count = data.count;
        const instanceMatrix = data.instanceMatrix;
        const instanceColor = data.instanceColor;
        object = new InstancedMesh(geometry, material, count);
        object.instanceMatrix = new InstancedBufferAttribute(
          new Float32Array(instanceMatrix.array),
          16
        );
        if (instanceColor !== void 0)
          object.instanceColor = new InstancedBufferAttribute(
            new Float32Array(instanceColor.array),
            instanceColor.itemSize
          );
        break;
      }
      case "LOD":
        object = new LOD();
        break;
      case "Line":
        object = new Line(getGeometry(data.geometry), getMaterial(data.material));
        break;
      case "LineLoop":
        object = new LineLoop(getGeometry(data.geometry), getMaterial(data.material));
        break;
      case "LineSegments":
        object = new LineSegments(getGeometry(data.geometry), getMaterial(data.material));
        break;
      case "PointCloud":
      case "Points":
        object = new Points(getGeometry(data.geometry), getMaterial(data.material));
        break;
      case "Sprite":
        object = new Sprite(getMaterial(data.material));
        break;
      case "Group":
        object = new Group();
        break;
      case "Bone":
        object = new Bone();
        break;
      default:
        object = new Object3D();
    }
    object.uuid = data.uuid;
    if (data.name !== void 0)
      object.name = data.name;
    if (data.matrix !== void 0) {
      object.matrix.fromArray(data.matrix);
      if (data.matrixAutoUpdate !== void 0)
        object.matrixAutoUpdate = data.matrixAutoUpdate;
      if (object.matrixAutoUpdate)
        object.matrix.decompose(object.position, object.quaternion, object.scale);
    } else {
      if (data.position !== void 0)
        object.position.fromArray(data.position);
      if (data.rotation !== void 0)
        object.rotation.fromArray(data.rotation);
      if (data.quaternion !== void 0)
        object.quaternion.fromArray(data.quaternion);
      if (data.scale !== void 0)
        object.scale.fromArray(data.scale);
    }
    if (data.up !== void 0)
      object.up.fromArray(data.up);
    if (data.castShadow !== void 0)
      object.castShadow = data.castShadow;
    if (data.receiveShadow !== void 0)
      object.receiveShadow = data.receiveShadow;
    if (data.shadow) {
      if (data.shadow.bias !== void 0)
        object.shadow.bias = data.shadow.bias;
      if (data.shadow.normalBias !== void 0)
        object.shadow.normalBias = data.shadow.normalBias;
      if (data.shadow.radius !== void 0)
        object.shadow.radius = data.shadow.radius;
      if (data.shadow.mapSize !== void 0)
        object.shadow.mapSize.fromArray(data.shadow.mapSize);
      if (data.shadow.camera !== void 0)
        object.shadow.camera = this.parseObject(data.shadow.camera);
    }
    if (data.visible !== void 0)
      object.visible = data.visible;
    if (data.frustumCulled !== void 0)
      object.frustumCulled = data.frustumCulled;
    if (data.renderOrder !== void 0)
      object.renderOrder = data.renderOrder;
    if (data.userData !== void 0)
      object.userData = data.userData;
    if (data.layers !== void 0)
      object.layers.mask = data.layers;
    if (data.children !== void 0) {
      const children = data.children;
      for (let i = 0; i < children.length; i++) {
        object.add(this.parseObject(children[i], geometries, materials, textures, animations));
      }
    }
    if (data.animations !== void 0) {
      const objectAnimations = data.animations;
      for (let i = 0; i < objectAnimations.length; i++) {
        const uuid = objectAnimations[i];
        object.animations.push(animations[uuid]);
      }
    }
    if (data.type === "LOD") {
      if (data.autoUpdate !== void 0)
        object.autoUpdate = data.autoUpdate;
      const levels = data.levels;
      for (let l = 0; l < levels.length; l++) {
        const level = levels[l];
        const child = object.getObjectByProperty("uuid", level.object);
        if (child !== void 0) {
          object.addLevel(child, level.distance, level.hysteresis);
        }
      }
    }
    return object;
  }
  bindSkeletons(object, skeletons) {
    if (Object.keys(skeletons).length === 0)
      return;
    object.traverse(function(child) {
      if (child.isSkinnedMesh === true && child.skeleton !== void 0) {
        const skeleton = skeletons[child.skeleton];
        if (skeleton === void 0) {
          console.warn("ObjectLoader: No skeleton found with UUID:", child.skeleton);
        } else {
          child.bind(skeleton, child.bindMatrix);
        }
      }
    });
  }
}
const TEXTURE_MAPPING = {
  UVMapping,
  CubeReflectionMapping,
  CubeRefractionMapping,
  EquirectangularReflectionMapping,
  EquirectangularRefractionMapping,
  CubeUVReflectionMapping
};
const TEXTURE_WRAPPING = {
  RepeatWrapping,
  ClampToEdgeWrapping,
  MirroredRepeatWrapping
};
const TEXTURE_FILTER = {
  NearestFilter,
  NearestMipmapNearestFilter,
  NearestMipmapLinearFilter,
  LinearFilter,
  LinearMipmapNearestFilter,
  LinearMipmapLinearFilter
};

class TextureLoader extends Loader {
  constructor(manager) {
    super(manager);
  }
  load(url, onLoad, onProgress, onError) {
    const texture = new Texture();
    const loader = new ImageLoader(this.manager);
    loader.setCrossOrigin(this.crossOrigin);
    loader.setPath(this.path);
    loader.load(
      url,
      function(image) {
        texture.image = image;
        texture.needsUpdate = true;
        if (onLoad !== void 0) {
          onLoad(texture);
        }
      },
      onProgress,
      onError
    );
    return texture;
  }
}

export { BufferGeometryLoader, Cache, DefaultLoadingManager, FileLoader, ImageBitmapLoader, ImageLoader, Loader, LoaderUtils, LoadingManager, MaterialLoader, ObjectLoader, TextureLoader };
