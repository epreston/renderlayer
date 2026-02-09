import { Vector2, Vector4 } from '@renderlayer/math';
import { FloatType } from '@renderlayer/shared';
import { DataArrayTexture } from '@renderlayer/textures';

/**
 * @import { WebGLCapabilities, WebGLTextures } from "@renderlayer/webgl"
 */

class WebGLMorphtargets {
  #gl;
  #capabilities;
  #textures;

  #morphTextures = new WeakMap();
  #morph = new Vector4();

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLCapabilities} capabilities
   * @param {WebGLTextures} textures
   */
  constructor(gl, capabilities, textures) {
    this.#gl = gl;
    this.#capabilities = capabilities;
    this.#textures = textures;
  }

  update(object, geometry, program) {
    const gl = this.#gl;
    const capabilities = this.#capabilities;
    const textures = this.#textures;

    const objectInfluences = object.morphTargetInfluences;

    // Encodes morph targets into an array of data textures.
    // Each layer represents a single morph target.

    const morphAttribute =
      geometry.morphAttributes.position ||
      geometry.morphAttributes.normal ||
      geometry.morphAttributes.color;

    const morphTargetsCount = morphAttribute !== undefined ? morphAttribute.length : 0;

    let entry = this.#morphTextures.get(geometry);

    if (entry === undefined || entry.count !== morphTargetsCount) {
      if (entry !== undefined) entry.texture.dispose();

      const hasMorphPosition = geometry.morphAttributes.position !== undefined;
      const hasMorphNormals = geometry.morphAttributes.normal !== undefined;
      const hasMorphColors = geometry.morphAttributes.color !== undefined;

      const morphTargets = geometry.morphAttributes.position || [];
      const morphNormals = geometry.morphAttributes.normal || [];
      const morphColors = geometry.morphAttributes.color || [];

      let vertexDataCount = 0;

      if (hasMorphPosition === true) vertexDataCount = 1;
      if (hasMorphNormals === true) vertexDataCount = 2;
      if (hasMorphColors === true) vertexDataCount = 3;

      let width = geometry.attributes.position.count * vertexDataCount;
      let height = 1;

      if (width > capabilities.maxTextureSize) {
        height = Math.ceil(width / capabilities.maxTextureSize);
        width = capabilities.maxTextureSize;
      }

      const buffer = new Float32Array(width * height * 4 * morphTargetsCount);

      const texture = new DataArrayTexture(buffer, width, height, morphTargetsCount);
      texture.type = FloatType;
      texture.needsUpdate = true;

      // fill buffer

      const vertexDataStride = vertexDataCount * 4;

      for (let i = 0; i < morphTargetsCount; i++) {
        const morphTarget = morphTargets[i];
        const morphNormal = morphNormals[i];
        const morphColor = morphColors[i];

        const offset = width * height * 4 * i;

        for (let j = 0; j < morphTarget.count; j++) {
          const stride = j * vertexDataStride;

          if (hasMorphPosition === true) {
            this.#morph.fromBufferAttribute(morphTarget, j);

            buffer[offset + stride + 0] = this.#morph.x;
            buffer[offset + stride + 1] = this.#morph.y;
            buffer[offset + stride + 2] = this.#morph.z;
            buffer[offset + stride + 3] = 0;
          }

          if (hasMorphNormals === true) {
            this.#morph.fromBufferAttribute(morphNormal, j);

            buffer[offset + stride + 4] = this.#morph.x;
            buffer[offset + stride + 5] = this.#morph.y;
            buffer[offset + stride + 6] = this.#morph.z;
            buffer[offset + stride + 7] = 0;
          }

          if (hasMorphColors === true) {
            this.#morph.fromBufferAttribute(morphColor, j);

            buffer[offset + stride + 8] = this.#morph.x;
            buffer[offset + stride + 9] = this.#morph.y;
            buffer[offset + stride + 10] = this.#morph.z;
            buffer[offset + stride + 11] = morphColor.itemSize === 4 ? this.#morph.w : 1;
          }
        }
      }

      entry = {
        count: morphTargetsCount,
        texture: texture,
        size: new Vector2(width, height)
      };

      this.#morphTextures.set(geometry, entry);

      const disposeTexture = () => {
        texture.dispose();
        this.#morphTextures.delete(geometry);
        geometry.removeEventListener('dispose', disposeTexture);
      };

      geometry.addEventListener('dispose', disposeTexture);
    }

    //

    let morphInfluencesSum = 0;

    for (let i = 0; i < objectInfluences.length; i++) {
      morphInfluencesSum += objectInfluences[i];
    }

    const morphBaseInfluence = geometry.morphTargetsRelative ? 1 : 1 - morphInfluencesSum;

    program.getUniforms().setValue(gl, 'morphTargetBaseInfluence', morphBaseInfluence);
    program.getUniforms().setValue(gl, 'morphTargetInfluences', objectInfluences);

    program.getUniforms().setValue(gl, 'morphTargetsTexture', entry.texture, textures);
    program.getUniforms().setValue(gl, 'morphTargetsTextureSize', entry.size);
  }
}

export { WebGLMorphtargets };
