import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Color, Matrix3, Matrix4, Quaternion, Vector2, Vector3, Vector4 } from '@renderlayer/math';
import { CubeReflectionMapping, UVMapping } from '@renderlayer/shared';

import { Texture } from '../../textures/src/Texture.js';
import * as UniformsUtils from '../src/UniformsUtils.js';

describe('Renderers', () => {
  describe('Shaders', () => {
    describe('UniformsUtils', () => {
      test('Instancing', () => {
        expect(UniformsUtils).toBeTruthy();
      });

      test.todo('UniformsUtils.clone', () => {
        // implement
      });

      test.todo('UniformsUtils.merge', () => {
        // implement
      });

      test('cloneUniforms copies values', () => {
        const uniforms = {
          floatValue: { value: 1.23 },
          intValue: { value: 1 },
          boolValue: { value: true },
          colorValue: { value: new Color(0xff00ff) },
          vector2Value: { value: new Vector2(1, 2) },
          vector3Value: { value: new Vector3(1, 2, 3) },
          vector4Value: { value: new Vector4(1, 2, 3, 4) },
          matrix3Value: { value: new Matrix3() },
          matrix4Value: { value: new Matrix4() },
          quatValue: { value: new Quaternion(1, 2, 3, 4) },
          arrayValue: { value: [1, 2, 3, 4] },
          textureValue: { value: new Texture(null, CubeReflectionMapping) }
        };

        const uniformClones = UniformsUtils.cloneUniforms(uniforms);

        expect(uniforms.floatValue.value === uniformClones.floatValue.value).toBeTruthy();
        expect(uniforms.intValue.value === uniformClones.intValue.value).toBeTruthy();
        expect(uniforms.boolValue.value === uniformClones.boolValue.value).toBeTruthy();
        expect(uniforms.colorValue.value.equals(uniformClones.colorValue.value)).toBeTruthy();
        expect(uniforms.vector2Value.value.equals(uniformClones.vector2Value.value)).toBeTruthy();
        expect(uniforms.vector3Value.value.equals(uniformClones.vector3Value.value)).toBeTruthy();
        expect(uniforms.vector4Value.value.equals(uniformClones.vector4Value.value)).toBeTruthy();
        expect(uniforms.matrix3Value.value.equals(uniformClones.matrix3Value.value)).toBeTruthy();
        expect(uniforms.matrix4Value.value.equals(uniformClones.matrix4Value.value)).toBeTruthy();
        expect(uniforms.quatValue.value.equals(uniformClones.quatValue.value)).toBeTruthy();
        expect(
          uniforms.textureValue.value.source.uuid === uniformClones.textureValue.value.source.uuid
        ).toBeTruthy();
        expect(
          uniforms.textureValue.value.mapping === uniformClones.textureValue.value.mapping
        ).toBeTruthy();
        for (let i = 0; i < uniforms.arrayValue.value.length; ++i) {
          expect(uniforms.arrayValue.value[i] === uniformClones.arrayValue.value[i]).toBeTruthy();
        }
      });

      test('cloneUniforms clones properties', () => {
        const uniforms = {
          floatValue: { value: 1.23 },
          intValue: { value: 1 },
          boolValue: { value: true },
          colorValue: { value: new Color(0xff00ff) },
          vector2Value: { value: new Vector2(1, 2) },
          vector3Value: { value: new Vector3(1, 2, 3) },
          vector4Value: { value: new Vector4(1, 2, 3, 4) },
          matrix3Value: { value: new Matrix3() },
          matrix4Value: { value: new Matrix4() },
          quatValue: { value: new Quaternion(1, 2, 3, 4) },
          arrayValue: { value: [1, 2, 3, 4] },
          textureValue: { value: new Texture(null, CubeReflectionMapping) }
        };

        const uniformClones = UniformsUtils.cloneUniforms(uniforms);

        // Modify the originals
        uniforms.floatValue.value = 123.0;
        uniforms.intValue.value = 123;
        uniforms.boolValue.value = false;
        uniforms.colorValue.value.r = 123.0;
        uniforms.vector2Value.value.x = 123.0;
        uniforms.vector3Value.value.x = 123.0;
        uniforms.vector4Value.value.x = 123.0;
        uniforms.matrix3Value.value.elements[0] = 123.0;
        uniforms.matrix4Value.value.elements[0] = 123.0;
        uniforms.quatValue.value.x = 123.0;
        uniforms.arrayValue.value[0] = 123.0;
        uniforms.textureValue.value.mapping = UVMapping;

        expect(uniforms.floatValue.value !== uniformClones.floatValue.value).toBeTruthy();
        expect(uniforms.intValue.value !== uniformClones.intValue.value).toBeTruthy();
        expect(uniforms.boolValue.value !== uniformClones.boolValue.value).toBeTruthy();
        expect(!uniforms.colorValue.value.equals(uniformClones.colorValue.value)).toBeTruthy();
        expect(!uniforms.vector2Value.value.equals(uniformClones.vector2Value.value)).toBeTruthy();
        expect(!uniforms.vector3Value.value.equals(uniformClones.vector3Value.value)).toBeTruthy();
        expect(!uniforms.vector4Value.value.equals(uniformClones.vector4Value.value)).toBeTruthy();
        expect(!uniforms.matrix3Value.value.equals(uniformClones.matrix3Value.value)).toBeTruthy();
        expect(!uniforms.matrix4Value.value.equals(uniformClones.matrix4Value.value)).toBeTruthy();
        expect(!uniforms.quatValue.value.equals(uniformClones.quatValue.value)).toBeTruthy();
        expect(
          uniforms.textureValue.value.mapping !== uniformClones.textureValue.value.mapping
        ).toBeTruthy();
        expect(uniforms.arrayValue.value[0] !== uniformClones.arrayValue.value[0]).toBeTruthy();

        // Texture source remains same
        expect(
          uniforms.textureValue.value.source.uuid === uniformClones.textureValue.value.source.uuid
        ).toBeTruthy();
      });

      test('cloneUniforms skips render target textures', () => {
        const uniforms = {
          textureValue: { value: new Texture(null, CubeReflectionMapping) }
        };

        uniforms.textureValue.value.isRenderTargetTexture = true;

        const uniformClones = UniformsUtils.cloneUniforms(uniforms);
        expect('cannot be cloned').toHaveBeenWarned();

        expect(uniformClones.textureValue.value === null).toBeTruthy();
      });

      test.todo('mergeUniforms', () => {
        // implement
      });

      test.todo('cloneUniformsGroups', () => {
        // implement
      });

      test.todo('getUnlitUniformColorSpace', () => {
        // implement
      });
    });
  });
});
