import { Vector2, Vector4 } from '@renderlayer/math';
import { FloatType } from '@renderlayer/shared';
import { DataArrayTexture } from '@renderlayer/textures';

class WebGLMorphtargets {
  /** @param { WebGL2RenderingContext} gl */
  constructor(gl, capabilities, textures) {
    this._gl = gl;
    this._capabilities = capabilities;
    this._textures = textures;

    this._morphTextures = new WeakMap();
    this._morph = new Vector4();
    this._workInfluences = [];

    for (let i = 0; i < 8; i++) {
      this._workInfluences[i] = [i, 0];
    }
  }

  update(object, geometry, program) {
    const { _gl, _capabilities, _textures } = this;

    const objectInfluences = object.morphTargetInfluences;

    // Encodes morph targets into an array of data textures.
    // Each layer represents a single morph target.

    const morphAttribute =
      geometry.morphAttributes.position ||
      geometry.morphAttributes.normal ||
      geometry.morphAttributes.color;

    const morphTargetsCount = morphAttribute !== undefined ? morphAttribute.length : 0;

    let entry = this._morphTextures.get(geometry);

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

      if (width > _capabilities.maxTextureSize) {
        height = Math.ceil(width / _capabilities.maxTextureSize);
        width = _capabilities.maxTextureSize;
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
            this._morph.fromBufferAttribute(morphTarget, j);

            buffer[offset + stride + 0] = this._morph.x;
            buffer[offset + stride + 1] = this._morph.y;
            buffer[offset + stride + 2] = this._morph.z;
            buffer[offset + stride + 3] = 0;
          }

          if (hasMorphNormals === true) {
            this._morph.fromBufferAttribute(morphNormal, j);

            buffer[offset + stride + 4] = this._morph.x;
            buffer[offset + stride + 5] = this._morph.y;
            buffer[offset + stride + 6] = this._morph.z;
            buffer[offset + stride + 7] = 0;
          }

          if (hasMorphColors === true) {
            this._morph.fromBufferAttribute(morphColor, j);

            buffer[offset + stride + 8] = this._morph.x;
            buffer[offset + stride + 9] = this._morph.y;
            buffer[offset + stride + 10] = this._morph.z;
            buffer[offset + stride + 11] = morphColor.itemSize === 4 ? this._morph.w : 1;
          }
        }
      }

      entry = {
        count: morphTargetsCount,
        texture: texture,
        size: new Vector2(width, height)
      };

      this._morphTextures.set(geometry, entry);

      const disposeTexture = () => {
        texture.dispose();
        this._morphTextures.delete(geometry);
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

    program.getUniforms().setValue(_gl, 'morphTargetBaseInfluence', morphBaseInfluence);
    program.getUniforms().setValue(_gl, 'morphTargetInfluences', objectInfluences);

    program.getUniforms().setValue(_gl, 'morphTargetsTexture', entry.texture, _textures);
    program.getUniforms().setValue(_gl, 'morphTargetsTextureSize', entry.size);
  }
}

export { WebGLMorphtargets };
