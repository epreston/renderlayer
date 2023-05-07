import { LinearSRGBColorSpace } from '@renderlayer/shared';

// Uniform Utilities

export function cloneUniforms(src) {
  const dst = {};

  for (const u in src) {
    dst[u] = {};

    for (const p in src[u]) {
      const property = src[u][p];

      if (
        property &&
        (property.isColor ||
          property.isMatrix3 ||
          property.isMatrix4 ||
          property.isVector2 ||
          property.isVector3 ||
          property.isVector4 ||
          property.isTexture ||
          property.isQuaternion)
      ) {
        if (property.isRenderTargetTexture) {
          console.warn(
            'UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().'
          );
          dst[u][p] = null;
        } else {
          dst[u][p] = property.clone();
        }
      } else if (Array.isArray(property)) {
        dst[u][p] = property.slice();
      } else {
        dst[u][p] = property;
      }
    }
  }

  return dst;
}

export function mergeUniforms(uniforms) {
  const merged = {};

  for (let u = 0; u < uniforms.length; u++) {
    const tmp = cloneUniforms(uniforms[u]);

    for (const p in tmp) {
      merged[p] = tmp[p];
    }
  }

  return merged;
}

export function cloneUniformsGroups(src) {
  const dst = [];

  for (let u = 0; u < src.length; u++) {
    dst.push(src[u].clone());
  }

  return dst;
}

export function getUnlitUniformColorSpace(renderer) {
  if (renderer.getRenderTarget() === null) {
    // if rendering to a render target, set background color to
    // working color space (Linear-sRGB) because we know whatever
    // color space transform is at the end of the post-processing
    // chain will affect the background color. If rendering to canvas,
    // set background color in renderer.outputEncoding color space
    // because we know it won't be affected by the usual encoding fragment.
    return renderer.outputColorSpace;
  }

  return LinearSRGBColorSpace;
}

// TODO: Legacy
// const UniformsUtils = { clone: cloneUniforms, merge: mergeUniforms };=
// export { UniformsUtils };
