import { describe, expect, it, test, vi } from 'vitest';
import { x, y, z } from './math-constants.js';
import { createBoxMorphGeometry, addMorphAttributes } from './morphGeometryHelpers.js';

import { EventDispatcher } from '@renderlayer/core';
import { Matrix4, Quaternion, Sphere, Vector3 } from '@renderlayer/math';
import { BufferGeometryLoader } from '@renderlayer/loaders';

import {
  BufferAttribute,
  Float16BufferAttribute,
  Uint16BufferAttribute,
  Uint32BufferAttribute
} from '../src/BufferAttribute.js';
import { toHalfFloat } from '../src/BufferAttributeUtils.js';
import { BufferGeometry } from '../src/BufferGeometry.js';

const DegToRad = Math.PI / 180;

function bufferAttributeEquals(a, b, tolerance = 0.0001) {
  if (a.count !== b.count || a.itemSize !== b.itemSize) {
    return false;
  }

  for (let i = 0, il = a.count * a.itemSize; i < il; i++) {
    const delta = a[i] - b[i];
    if (delta > tolerance) {
      return false;
    }
  }

  return true;
}

function getBBForVertices(vertices) {
  const geometry = new BufferGeometry();

  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
  geometry.computeBoundingBox();

  return geometry.boundingBox;
}

function getBSForVertices(vertices) {
  const geometry = new BufferGeometry();

  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
  geometry.computeBoundingSphere();

  return geometry.boundingSphere;
}

function getNormalsForVertices(vertices) {
  const geometry = new BufferGeometry();

  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
  geometry.computeVertexNormals();

  expect(geometry.attributes.normal).toBeDefined();

  return geometry.attributes.normal.array;
}

describe('Buffers', () => {
  describe('BufferGeometry', () => {
    test('constructor', () => {
      const object = new BufferGeometry();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new BufferGeometry();
      expect(object).toBeInstanceOf(EventDispatcher);
    });

    test('isBufferGeometry', () => {
      const object = new BufferGeometry();
      expect(object.isBufferGeometry).toBeTruthy();
    });

    test('type', () => {
      const object = new BufferGeometry();
      expect(object.type).toBe('BufferGeometry');
    });

    test('id', () => {
      const object = new BufferGeometry();
      expect(object.id).toBeDefined();

      // can change based on order of tests
      const prevId = object.id;

      const object2 = new BufferGeometry();
      expect(object2.id).toBeGreaterThan(prevId);
    });

    test('uuid', () => {
      const object = new BufferGeometry();

      expect(object.uuid).to.be.a('string');
      expect(object.uuid).to.have.length(36);
    });

    test('name', () => {
      const object = new BufferGeometry();
      expect(object.name).toBe('');
    });

    test.todo('index', () => {
      // implement
    });

    test.todo('attributes', () => {
      // implement
    });

    test.todo('morphAttributes', () => {
      // implement
    });

    test.todo('morphTargetsRelative', () => {
      // implement
    });

    test.todo('groups', () => {
      // implement
    });

    test.todo('boundingBox', () => {
      // implement
    });

    test.todo('boundingSphere', () => {
      // implement
    });

    test.todo('drawRange', () => {
      // implement
    });

    test.todo('userData', () => {
      // implement
    });

    test('setIndex/getIndex', () => {
      const a = new BufferGeometry();
      const uint16 = [1, 2, 3];
      const uint32 = [65535, 65536, 65537];
      const str = 'foo';

      a.setIndex(uint16);
      expect(a.getIndex()).toBeInstanceOf(Uint16BufferAttribute);
      expect(a.getIndex().array).toEqual(new Uint16Array(uint16));

      a.setIndex(uint32);
      expect(a.getIndex()).toBeInstanceOf(Uint32BufferAttribute);
      expect(a.getIndex().array).toEqual(new Uint32Array(uint32));

      a.setIndex(str);
      expect(a.getIndex()).toBe(str);
    });

    test.todo('getAttribute', () => {
      // implement
    });

    test('set / delete Attribute', () => {
      const geometry = new BufferGeometry();
      const attributeName = 'position';

      expect(geometry.attributes[attributeName]).toBeUndefined();

      geometry.setAttribute(attributeName, new BufferAttribute(new Float32Array([1, 2, 3], 1)));

      expect(geometry.attributes[attributeName]).toBeDefined();

      geometry.deleteAttribute(attributeName);

      expect(geometry.attributes[attributeName]).toBeUndefined();
    });

    test('addGroup', () => {
      const a = new BufferGeometry();

      const expected = [
        {
          start: 0,
          count: 1,
          materialIndex: 0
        },
        {
          start: 1,
          count: 2,
          materialIndex: 2
        }
      ];

      a.addGroup(0, 1, 0);
      a.addGroup(1, 2, 2);

      expect(a.groups).toEqual(expected);

      a.clearGroups();
      expect(a.groups.length).toBe(0);
    });

    test.todo('clearGroups', () => {
      // implement
    });

    test('setDrawRange', () => {
      const a = new BufferGeometry();

      a.setDrawRange(1.0, 7);

      expect(a.drawRange).toEqual({
        start: 1,
        count: 7
      });
    });

    test('applyMatrix4', () => {
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(new Float32Array(6), 3));

      // prettier-ignore
      const matrix = new Matrix4().set(
				1, 0, 0, 1.5,
				0, 1, 0, - 2,
				0, 0, 1,   3,
				0, 0, 0,   1
			);

      geometry.applyMatrix4(matrix);

      const position = geometry.attributes.position.array;
      const m = matrix.elements;

      expect(position[0] === m[12] && position[1] === m[13] && position[2] === m[14]).toBeTruthy();

      expect(position[3] === m[12] && position[4] === m[13] && position[5] === m[14]).toBeTruthy();

      expect(geometry.attributes.position.version === 1).toBeTruthy();
    });

    test('applyQuaternion', () => {
      const geometry = new BufferGeometry();
      geometry.setAttribute(
        'position',
        new BufferAttribute(new Float32Array([1, 2, 3, 4, 5, 6]), 3)
      );

      const q = new Quaternion(0.5, 0.5, 0.5, 0.5);
      geometry.applyQuaternion(q);

      const pos = geometry.attributes.position.array;

      // geometry was rotated around the (1, 1, 1) axis.
      expect(
        pos[0] === 3 && pos[1] === 1 && pos[2] === 2 && pos[3] === 6 && pos[4] === 4 && pos[5] === 5
      ).toBeTruthy();
    });

    test('rotateX/Y/Z', () => {
      const geometry = new BufferGeometry();
      geometry.setAttribute(
        'position',
        new BufferAttribute(new Float32Array([1, 2, 3, 4, 5, 6]), 3)
      );

      const pos = geometry.attributes.position.array;

      geometry.rotateX(180 * DegToRad);

      // object was rotated around x so all items should be flipped but the x ones
      expect(
        pos[0] === 1 &&
          pos[1] === -2 &&
          pos[2] === -3 &&
          pos[3] === 4 &&
          pos[4] === -5 &&
          pos[5] === -6
      ).toBeTruthy();

      geometry.rotateY(180 * DegToRad);

      // vertices were rotated around y so all items should be flipped again but the y ones
      expect(
        pos[0] === -1 &&
          pos[1] === -2 &&
          pos[2] === 3 &&
          pos[3] === -4 &&
          pos[4] === -5 &&
          pos[5] === 6
      ).toBeTruthy();

      geometry.rotateZ(180 * DegToRad);

      // vertices were rotated around z so all items should be flipped again but the z ones
      expect(
        pos[0] === 1 && pos[1] === 2 && pos[2] === 3 && pos[3] === 4 && pos[4] === 5 && pos[5] === 6
      ).toBeTruthy();
    });

    test('translate', () => {
      const geometry = new BufferGeometry();
      geometry.setAttribute(
        'position',
        new BufferAttribute(new Float32Array([1, 2, 3, 4, 5, 6]), 3)
      );

      const pos = geometry.attributes.position.array;

      geometry.translate(10, 20, 30);

      expect(
        pos[0] === 11 &&
          pos[1] === 22 &&
          pos[2] === 33 &&
          pos[3] === 14 &&
          pos[4] === 25 &&
          pos[5] === 36
      ).toBeTruthy();
    });

    test('scale', () => {
      const geometry = new BufferGeometry();
      geometry.setAttribute(
        'position',
        new BufferAttribute(new Float32Array([-1, -1, -1, 2, 2, 2]), 3)
      );

      const pos = geometry.attributes.position.array;

      geometry.scale(1, 2, 3);

      expect(
        pos[0] === -1 &&
          pos[1] === -2 &&
          pos[2] === -3 &&
          pos[3] === 2 &&
          pos[4] === 4 &&
          pos[5] === 6
      ).toBeTruthy();
    });

    test('lookAt', () => {
      const a = new BufferGeometry();

      // prettier-ignore
      const vertices = new Float32Array([
				- 1.0, - 1.0, 1.0,
				  1.0, - 1.0, 1.0,
				  1.0,   1.0, 1.0,

				  1.0,   1.0, 1.0,
				- 1.0,   1.0, 1.0,
				- 1.0, - 1.0, 1.0
			]);

      a.setAttribute('position', new BufferAttribute(vertices, 3));

      const sqrt = Math.sqrt(2);

      // prettier-ignore
      const expected = new Float32Array([
				  1,    0, - sqrt,
				- 1,    0, - sqrt,
				- 1, sqrt,      0,

				- 1, sqrt,      0,
				  1, sqrt,      0,
				  1,    0, - sqrt
			]);

      a.lookAt(new Vector3(0, 1, -1));

      // rotation
      expect(bufferAttributeEquals(a.attributes.position.array, expected)).toBeTruthy();
    });

    test('center', () => {
      const geometry = new BufferGeometry();

      // prettier-ignore
      geometry.setAttribute('position', new BufferAttribute(
        new Float32Array([
				  - 1, - 1, - 1,
				    1,   1,   1,
				    4,   4,   4
			]), 3 ));

      geometry.center();

      const pos = geometry.attributes.position.array;

      // the boundingBox should go from (-1, -1, -1) to (4, 4, 4) so it has a size of (5, 5, 5)
      // after centering it the vertices should be placed between (-2.5, -2.5, -2.5) and (2.5, 2.5, 2.5)
      expect(
        pos[0] === -2.5 &&
          pos[1] === -2.5 &&
          pos[2] === -2.5 &&
          pos[3] === -0.5 &&
          pos[4] === -0.5 &&
          pos[5] === -0.5 &&
          pos[6] === 2.5 &&
          pos[7] === 2.5 &&
          pos[8] === 2.5
      ).toBeTruthy();
    });

    test.todo('setFromPoints', () => {
      // implement
    });

    test('computeBoundingBox', () => {
      let bb = getBBForVertices([-1, -2, -3, 13, -2, -3.5, -1, -20, 0, -4, 5, 6]);

      expect(bb.min.x === -4 && bb.min.y === -20 && bb.min.z === -3.5).toBeTruthy();
      expect(bb.max.x === 13 && bb.max.y === 5 && bb.max.z === 6).toBeTruthy();

      bb = getBBForVertices([-1, -1, -1]);

      // since there is only one vertex, max and min are equal
      expect(bb.min.x === bb.max.x && bb.min.y === bb.max.y && bb.min.z === bb.max.z).toBeTruthy();

      // since there is only one vertex, min and max are this vertex
      expect(bb.min.x === -1 && bb.min.y === -1 && bb.min.z === -1).toBeTruthy();
    });

    test('computeBoundingSphere', () => {
      let bs = getBSForVertices([-10, 0, 0, 10, 0, 0]);

      expect(bs.radius === 10).toBeTruthy();
      expect(bs.center.x === 0 && bs.center.y === 0 && bs.center.y === 0).toBeTruthy();

      bs = getBSForVertices([-5, 11, -3, 5, -11, 3]);
      const radius = new Vector3(5, 11, 3).length();

      expect(bs.radius === radius).toBeTruthy();
      expect(bs.center.x === 0 && bs.center.y === 0 && bs.center.y === 0).toBeTruthy();
    });

    const toHalfFloatArray = (f32Array) => {
      const f16Array = new Uint16Array(f32Array.length);
      for (let i = 0, n = f32Array.length; i < n; ++i) {
        f16Array[i] = toHalfFloat(f32Array[i]);
      }
      return f16Array;
    };

    test('computeBoundingBox - Float16', () => {
      const vertices = [-1, -2, -3, 13, -2, -3.5, -1, -20, 0, -4, 5, 6];
      const geometry = new BufferGeometry();

      geometry.setAttribute('position', new Float16BufferAttribute(toHalfFloatArray(vertices), 3));
      geometry.computeBoundingBox();

      let bb = geometry.boundingBox;

      expect(bb.min.x === -4 && bb.min.y === -20 && bb.min.z === -3.5).toBeTruthy();
      expect(bb.max.x === 13 && bb.max.y === 5 && bb.max.z === 6).toBeTruthy();

      bb = getBBForVertices([-1, -1, -1]);

      expect(bb.min.x === bb.max.x && bb.min.y === bb.max.y && bb.min.z === bb.max.z).toBeTruthy();

      expect(bb.min.x === -1 && bb.min.y === -1 && bb.min.z === -1).toBeTruthy();
    });

    test('computeBoundingSphere - Float16', () => {
      const vertices = [-10, 0, 0, 10, 0, 0];
      const geometry = new BufferGeometry();

      geometry.setAttribute('position', new Float16BufferAttribute(toHalfFloatArray(vertices), 3));
      geometry.computeBoundingSphere();

      let bs = geometry.boundingSphere;

      expect(bs.radius === 10).toBeTruthy();
      expect(bs.center.x === 0 && bs.center.y === 0 && bs.center.y === 0).toBeTruthy();

      bs = getBSForVertices([-5, 11, -3, 5, -11, 3]);
      const radius = new Vector3(5, 11, 3).length();

      expect(bs.radius === radius).toBeTruthy();
      expect(bs.center.x === 0 && bs.center.y === 0 && bs.center.y === 0).toBeTruthy();
    });

    test('computeBoundingSphere - morph geometry', () => {
      const geometry = createBoxMorphGeometry();
      geometry.computeBoundingSphere();

      const bs = geometry.boundingSphere;

      expect(bs.radius).toBeCloseTo(2.44948);
      expect(bs.center.x === 0 && bs.center.y === 0 && bs.center.y === 0).toBeTruthy();
    });

    test('computeBoundingBox - morph geometry', () => {
      const geometry = createBoxMorphGeometry();
      geometry.computeBoundingBox();

      const bb = geometry.boundingBox;

      expect(bb).toMatchInlineSnapshot(`
        Box3 {
          "max": Vector3 {
            "x": 2,
            "y": 1.4142135381698608,
            "z": 1.4142135381698608,
          },
          "min": Vector3 {
            "x": -2,
            "y": -1.4142135381698608,
            "z": -1.4142135381698608,
          },
        }
      `);
    });

    test('computeTangents', () => {
      const geometry = createBoxMorphGeometry();

      expect(geometry.hasAttribute('tangent')).toBeFalsy();

      geometry.computeTangents();

      expect(geometry.hasAttribute('tangent')).toBeTruthy();
      expect(geometry.getAttribute('tangent')).toBeDefined();
    });

    test('computeVertexNormals', () => {
      // get normals for a counter clockwise created triangle
      let normals = getNormalsForVertices([-1, 0, 0, 1, 0, 0, 0, 1, 0]);

      // first normal is pointing to screen since the the triangle was created counter clockwise
      expect(normals[0] === 0 && normals[1] === 0 && normals[2] === 1).toBeTruthy();

      // second normal is pointing to screen since the the triangle was created counter clockwise
      expect(normals[3] === 0 && normals[4] === 0 && normals[5] === 1).toBeTruthy();

      // third normal is pointing to screen since the the triangle was created counter clockwise
      expect(normals[6] === 0 && normals[7] === 0 && normals[8] === 1).toBeTruthy();

      // get normals for a clockwise created triangle
      normals = getNormalsForVertices([1, 0, 0, -1, 0, 0, 0, 1, 0]);

      // first normal is pointing to screen since the the triangle was created clockwise
      expect(normals[0] === 0 && normals[1] === 0 && normals[2] === -1).toBeTruthy();

      // second normal is pointing to screen since the the triangle was created clockwise
      expect(normals[3] === 0 && normals[4] === 0 && normals[5] === -1).toBeTruthy();

      // third normal is pointing to screen since the the triangle was created clockwise
      expect(normals[6] === 0 && normals[7] === 0 && normals[8] === -1).toBeTruthy();

      normals = getNormalsForVertices([0, 0, 1, 0, 0, -1, 1, 1, 0]);

      // the triangle is rotated by 45 degrees to the right so the normals of the three vertices
      // should point to (1, -1, 0).normalized(). The simplest solution is to check against a normalized
      // vector (1, -1, 0) but you will get calculation errors because of floating calculations so another
      // valid technique is to create a vector which stands in 90 degrees to the normals and calculate the
      // dot product which is the cos of the angle between them. This should be < floating calculation error
      // which can be taken from Number.EPSILON
      const direction = new Vector3(1, 1, 0).normalize(); // a vector which should have 90 degrees difference to normals
      const difference = direction.dot(new Vector3(normals[0], normals[1], normals[2]));

      // normal is equal to reference vector
      expect(difference < Number.EPSILON).toBeTruthy();

      // get normals for a line should be NAN because you need min a triangle to calculate normals
      normals = getNormalsForVertices([1, 0, 0, -1, 0, 0]);
      for (let i = 0; i < normals.length; i++) {
        // normals can't be calculated
        expect(!normals[i]).toBeTruthy();
      }
    });

    test('computeVertexNormals (indexed)', () => {
      const sqrt = 0.5 * Math.sqrt(2);

      // prettier-ignore
      const normal = new BufferAttribute( new Float32Array([
				- 1, 0, 0, - 1, 0, 0, - 1, 0, 0,
				sqrt, sqrt, 0, sqrt, sqrt, 0, sqrt, sqrt, 0,
				- 1, 0, 0
			]), 3 );

      // prettier-ignore
      const position = new BufferAttribute( new Float32Array([
				0.5, 0.5, 0.5, 0.5, 0.5, - 0.5, 0.5, - 0.5, 0.5,
				0.5, - 0.5, - 0.5, - 0.5, 0.5, - 0.5, - 0.5, 0.5, 0.5,
				- 0.5, - 0.5, - 0.5
			]), 3 );

      // prettier-ignore
      const index = new BufferAttribute( new Uint16Array([
				0, 2, 1, 2, 3, 1, 4, 6, 5, 6, 7, 5
			]), 1 );

      let a = new BufferGeometry();
      a.setAttribute('position', position);
      a.computeVertexNormals();
      expect(bufferAttributeEquals(normal, a.getAttribute('normal'))).toBeTruthy();

      // a second time to see if the existing normals get properly deleted
      a.computeVertexNormals();
      expect(bufferAttributeEquals(normal, a.getAttribute('normal'))).toBeTruthy();

      // indexed geometry
      a = new BufferGeometry();
      a.setAttribute('position', position);
      a.setIndex(index);
      a.computeVertexNormals();

      expect(bufferAttributeEquals(normal, a.getAttribute('normal'))).toBeTruthy();
    });

    test.todo('normalizeNormals', () => {
      // implement
    });

    test('toNonIndexed', () => {
      const geometry = new BufferGeometry();

      // prettier-ignore
      const vertices = new Float32Array( [
				0.5, 0.5, 0.5, 0.5, 0.5, - 0.5, 0.5, - 0.5, 0.5, 0.5, - 0.5, - 0.5
			] );

      const index = new BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]));

      // prettier-ignore
      const expected = new Float32Array([
				0.5, 0.5, 0.5, 0.5, - 0.5, 0.5, 0.5, 0.5, - 0.5,
				0.5, - 0.5, 0.5, 0.5, - 0.5, - 0.5, 0.5, 0.5, - 0.5
			]);

      geometry.setAttribute('position', new BufferAttribute(vertices, 3));
      geometry.setIndex(index);

      const nonIndexed = geometry.toNonIndexed();

      expect(nonIndexed.getAttribute('position').array).toEqual(expected);
    });

    test('toJSON', () => {
      const index = new BufferAttribute(new Uint16Array([0, 1, 2, 3]), 1);
      const attribute1 = new BufferAttribute(new Uint16Array([1, 3, 5, 7]), 1);
      attribute1.name = 'attribute1';
      const a = new BufferGeometry();
      a.name = 'JSON.Unit.test';
      // a.parameters = { "placeholder": 0 };
      a.setAttribute('attribute1', attribute1);
      a.setIndex(index);
      a.addGroup(0, 1, 2);
      a.boundingSphere = new Sphere(new Vector3(x, y, z), 0.5);
      let j = a.toJSON();

      const gold = {
        metadata: {
          version: 4.5,
          type: 'BufferGeometry',
          generator: 'BufferGeometry.toJSON'
        },
        uuid: a.uuid,
        type: 'BufferGeometry',
        name: 'JSON.Unit.test',
        data: {
          attributes: {
            attribute1: {
              itemSize: 1,
              type: 'Uint16Array',
              array: [1, 3, 5, 7],
              normalized: false,
              name: 'attribute1'
            }
          },
          index: {
            type: 'Uint16Array',
            array: [0, 1, 2, 3]
          },
          groups: [
            {
              start: 0,
              count: 1,
              materialIndex: 2
            }
          ],
          boundingSphere: {
            center: [2, 3, 4],
            radius: 0.5
          }
        }
      };

      expect(j).toEqual(gold);

      // add morphAttributes
      a.morphAttributes.attribute1 = [];
      a.morphAttributes.attribute1.push(attribute1.clone());
      j = a.toJSON();
      gold.data.morphAttributes = {
        attribute1: [
          {
            itemSize: 1,
            type: 'Uint16Array',
            array: [1, 3, 5, 7],
            normalized: false,
            name: 'attribute1'
          }
        ]
      };
      gold.data.morphTargetsRelative = false;

      expect(j).toEqual(gold);
    });

    test('clone', () => {
      const a = new BufferGeometry();
      a.setAttribute('attribute1', new BufferAttribute(new Float32Array([1, 2, 3, 4, 5, 6]), 3));
      a.setAttribute('attribute2', new BufferAttribute(new Float32Array([0, 1, 3, 5, 6]), 1));
      a.addGroup(0, 1, 2);
      a.computeBoundingBox();
      a.computeBoundingSphere();
      a.setDrawRange(0, 1);

      const b = a.clone();

      expect(a).not.toEqual(b);
      expect(a.id).not.toEqual(b.id);

      expect(Object.keys(a.attributes).count).toBe(Object.keys(b.attributes).count);

      expect(
        bufferAttributeEquals(a.getAttribute('attribute1'), b.getAttribute('attribute1'))
      ).toBeTruthy();

      expect(
        bufferAttributeEquals(a.getAttribute('attribute2'), b.getAttribute('attribute2'))
      ).toBeTruthy();

      expect(a.groups).toEqual(b.groups);

      expect(a.boundingBox.equals(b.boundingBox)).toBeTruthy();
      expect(a.boundingSphere.equals(b.boundingSphere)).toBeTruthy();

      expect(a.drawRange.start).toBe(b.drawRange.start);
      expect(a.drawRange.count).toBe(b.drawRange.count);
    });

    test('copy', () => {
      const geometry = new BufferGeometry();
      geometry.setAttribute(
        'attrName',
        new BufferAttribute(new Float32Array([1, 2, 3, 4, 5, 6]), 3)
      );
      geometry.setAttribute('attrName2', new BufferAttribute(new Float32Array([0, 1, 3, 5, 6]), 1));

      const copy = new BufferGeometry().copy(geometry);

      expect(copy !== geometry && geometry.id !== copy.id).toBeTruthy();

      Object.keys(geometry.attributes).forEach(function (key) {
        const attribute = geometry.attributes[key];
        expect(attribute !== undefined).toBeTruthy();

        for (let i = 0; i < attribute.array.length; i++) {
          expect(attribute.array[i] === copy.attributes[key].array[i]).toBeTruthy();
        }
      });
    });

    test('dispose', () => {
      const object = new BufferGeometry();
      object.dispose();

      expect(object).toBeDefined();
    });

    test('from BufferGeometryLoader', () => {
      const loader = new BufferGeometryLoader();
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(new Float32Array(6), 3));

      // add morph attributes for coverage
      addMorphAttributes(geometry);

      const object = loader.parse(geometry.toJSON());

      expect(object).toBeDefined();
    });
  });
});
