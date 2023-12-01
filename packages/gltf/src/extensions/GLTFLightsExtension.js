import { DirectionalLight, PointLight, SpotLight } from '@renderlayer/lights';
import { Color } from '@renderlayer/math';
import { LinearSRGBColorSpace } from '@renderlayer/shared';

import { EXTENSIONS } from './EXTENSIONS';

import { assignExtrasToUserData } from '../GLTFUtils';

/**
 * Punctual Lights Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
 */
export class GLTFLightsExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;

    // Object3D instance caches
    this.cache = { refs: {}, uses: {} };
  }

  _markDefs() {
    const parser = this.parser;
    const nodeDefs = this.parser.json.nodes || [];

    for (let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
      const nodeDef = nodeDefs[nodeIndex];

      if (
        nodeDef.extensions &&
        nodeDef.extensions[this.name] &&
        nodeDef.extensions[this.name].light !== undefined
      ) {
        parser._addNodeRef(this.cache, nodeDef.extensions[this.name].light);
      }
    }
  }

  _loadLight(lightIndex) {
    const parser = this.parser;
    const cacheKey = `light:${lightIndex}`;
    let dependency = parser.cache.get(cacheKey);

    if (dependency) return dependency;

    const json = parser.json;
    const extensions = (json.extensions && json.extensions[this.name]) || {};
    const lightDefs = extensions.lights || [];
    const lightDef = lightDefs[lightIndex];
    let lightNode;

    const color = new Color(16777215);

    if (lightDef.color !== undefined)
      color.setRGB(lightDef.color[0], lightDef.color[1], lightDef.color[2], LinearSRGBColorSpace);

    if (lightDef.color !== undefined) color.fromArray(lightDef.color);

    const range = lightDef.range !== undefined ? lightDef.range : 0;

    switch (lightDef.type) {
      case 'directional':
        lightNode = new DirectionalLight(color);
        lightNode.target.position.set(0, 0, -1);
        lightNode.add(lightNode.target);
        break;

      case 'point':
        lightNode = new PointLight(color);
        lightNode.distance = range;
        lightNode.decay = 2;
        break;

      case 'spot':
        lightNode = new SpotLight(color);
        lightNode.distance = range;
        // Handle spotlight properties.
        lightDef.spot = lightDef.spot || {};
        lightDef.spot.innerConeAngle =
          lightDef.spot.innerConeAngle !== undefined ? lightDef.spot.innerConeAngle : 0;
        lightDef.spot.outerConeAngle =
          lightDef.spot.outerConeAngle !== undefined ? lightDef.spot.outerConeAngle : Math.PI / 4;
        lightNode.angle = lightDef.spot.outerConeAngle;
        lightNode.penumbra = 1 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
        lightNode.target.position.set(0, 0, -1);
        lightNode.add(lightNode.target);
        lightNode.decay = 2;
        break;

      default:
        throw new Error(`GLTFLoader: Unexpected light type: ${lightDef.type}`);
    }

    // Some lights (e.g. spot) default to a position other than the origin. Reset the position
    // here, because node-level parsing will only override position if explicitly specified.
    lightNode.position.set(0, 0, 0);

    assignExtrasToUserData(lightNode, lightDef);

    if (lightDef.intensity !== undefined) lightNode.intensity = lightDef.intensity;

    lightNode.name = parser.createUniqueName(lightDef.name || `light_${lightIndex}`);

    dependency = Promise.resolve(lightNode);

    parser.cache.add(cacheKey, dependency);

    return dependency;
  }

  getDependency(type, index) {
    if (type !== 'light') return;

    return this._loadLight(index);
  }

  createNodeAttachment(nodeIndex) {
    const self = this;
    const parser = this.parser;
    const json = parser.json;
    const nodeDef = json.nodes[nodeIndex];
    const lightDef = (nodeDef.extensions && nodeDef.extensions[this.name]) || {};
    const lightIndex = lightDef.light;

    if (lightIndex === undefined) return null;

    return this._loadLight(lightIndex).then(function (light) {
      return parser._getNodeRef(self.cache, lightIndex, light);
    });
  }
}
