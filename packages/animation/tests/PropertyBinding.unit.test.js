import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { BoxGeometry } from '@renderlayer/geometries';
import { MeshBasicMaterial } from '@renderlayer/materials';
import { Mesh } from '@renderlayer/objects';
import { PropertyBinding } from '../src/PropertyBinding.js';

const _test_geometry = new BoxGeometry();
const _test_material = new MeshBasicMaterial();
const _test_mesh = new Mesh(_test_geometry, _test_material);
const _test_path = '.material.opacity';
const _test_parsedPath = {
  nodeName: '',
  objectName: 'material',
  objectIndex: undefined,
  propertyName: 'opacity',
  propertyIndex: undefined
};

describe('Animation', () => {
  describe('PropertyBinding', () => {
    test('constructor', () => {
      // mesh, path
      const object = new PropertyBinding(_test_mesh, _test_path);
      expect(object).toBeDefined();

      // mesh, path, parsedPath
      const object_all = new PropertyBinding(_test_mesh, _test_path, _test_parsedPath);
      expect(object_all).toBeDefined();
    });

    test('path', () => {
      const object = new PropertyBinding(_test_mesh, _test_path, _test_parsedPath);
      expect(object.path).toBeDefined();
      expect(object.path).toBe(_test_path);
    });

    test('parsedPath', () => {
      const object = new PropertyBinding(_test_mesh, _test_path, _test_parsedPath);
      expect(object.parsedPath).toBeDefined();
      expect(object.parsedPath).toBe(_test_parsedPath);
    });

    test('node', () => {
      const object = new PropertyBinding(_test_mesh, _test_path, _test_parsedPath);
      expect(object.node).toBeDefined();
    });

    test('rootNode', () => {
      const object = new PropertyBinding(_test_mesh, _test_path, _test_parsedPath);
      expect(object.rootNode).toBeDefined();
      expect(object.rootNode).toBe(_test_mesh);
    });

    test('Composite', () => {
      // static property
      expect(PropertyBinding.Composite).toBeDefined();
    });

    test('create', () => {
      const geometry = new BoxGeometry();
      const material = new MeshBasicMaterial();
      const mesh = new Mesh(geometry, material);
      const path = '.material.opacity';
      const parsedPath = {
        nodeName: '',
        objectName: 'material',
        objectIndex: undefined,
        propertyName: 'opacity',
        propertyIndex: undefined
      };

      const object = PropertyBinding.create(mesh, path, parsedPath);

      expect(object).toBeDefined();
      expect(object.path).toBe(path);
    });

    test('sanitizeNodeName', () => {
      // Leaves valid name intact.
      expect(PropertyBinding.sanitizeNodeName('valid-name-123_')).toBe('valid-name-123_');

      // Leaves non-latin unicode characters intact.
      expect(PropertyBinding.sanitizeNodeName('运气')).toBe('运气');

      // Replaces spaces with underscores.
      expect(PropertyBinding.sanitizeNodeName('space separated name 123_ -')).toBe(
        'space_separated_name_123__-'
      );

      // Allows various punctuation and symbols.
      expect(PropertyBinding.sanitizeNodeName('"Mátyás" %_* 😇')).toBe('"Mátyás"_%_*_😇');

      // Strips reserved characters.
      expect(PropertyBinding.sanitizeNodeName('/invalid: name ^123.[_]')).toBe(
        'invalid_name_^123_'
      );
    });

    test('parseTrackName', () => {
      const paths = [
        [
          '.property',
          {
            nodeName: undefined,
            objectName: undefined,
            objectIndex: undefined,
            propertyName: 'property',
            propertyIndex: undefined
          }
        ],

        [
          'nodeName.property',
          {
            nodeName: 'nodeName',
            objectName: undefined,
            objectIndex: undefined,
            propertyName: 'property',
            propertyIndex: undefined
          }
        ],

        [
          'a.property',
          {
            nodeName: 'a',
            objectName: undefined,
            objectIndex: undefined,
            propertyName: 'property',
            propertyIndex: undefined
          }
        ],

        [
          'no.de.Name.property',
          {
            nodeName: 'no.de.Name',
            objectName: undefined,
            objectIndex: undefined,
            propertyName: 'property',
            propertyIndex: undefined
          }
        ],

        [
          'no.d-e.Name.property',
          {
            nodeName: 'no.d-e.Name',
            objectName: undefined,
            objectIndex: undefined,
            propertyName: 'property',
            propertyIndex: undefined
          }
        ],

        [
          'nodeName.property[accessor]',
          {
            nodeName: 'nodeName',
            objectName: undefined,
            objectIndex: undefined,
            propertyName: 'property',
            propertyIndex: 'accessor'
          }
        ],

        [
          'nodeName.material.property[accessor]',
          {
            nodeName: 'nodeName',
            objectName: 'material',
            objectIndex: undefined,
            propertyName: 'property',
            propertyIndex: 'accessor'
          }
        ],

        [
          'no.de.Name.material.property',
          {
            nodeName: 'no.de.Name',
            objectName: 'material',
            objectIndex: undefined,
            propertyName: 'property',
            propertyIndex: undefined
          }
        ],

        [
          'no.de.Name.material[materialIndex].property',
          {
            nodeName: 'no.de.Name',
            objectName: 'material',
            objectIndex: 'materialIndex',
            propertyName: 'property',
            propertyIndex: undefined
          }
        ],

        [
          'uuid.property[accessor]',
          {
            nodeName: 'uuid',
            objectName: undefined,
            objectIndex: undefined,
            propertyName: 'property',
            propertyIndex: 'accessor'
          }
        ],

        [
          'uuid.objectName[objectIndex].propertyName[propertyIndex]',
          {
            nodeName: 'uuid',
            objectName: 'objectName',
            objectIndex: 'objectIndex',
            propertyName: 'propertyName',
            propertyIndex: 'propertyIndex'
          }
        ],

        [
          'parentName/nodeName.property',
          {
            // directoryName is currently unused.
            nodeName: 'nodeName',
            objectName: undefined,
            objectIndex: undefined,
            propertyName: 'property',
            propertyIndex: undefined
          }
        ],

        [
          'parentName/no.de.Name.property',
          {
            // directoryName is currently unused.
            nodeName: 'no.de.Name',
            objectName: undefined,
            objectIndex: undefined,
            propertyName: 'property',
            propertyIndex: undefined
          }
        ],

        [
          'parentName/parentName/nodeName.property[index]',
          {
            // directoryName is currently unused.
            nodeName: 'nodeName',
            objectName: undefined,
            objectIndex: undefined,
            propertyName: 'property',
            propertyIndex: 'index'
          }
        ],

        [
          '.bone[Armature.DEF_cog].position',
          {
            nodeName: undefined,
            objectName: 'bone',
            objectIndex: 'Armature.DEF_cog',
            propertyName: 'position',
            propertyIndex: undefined
          }
        ],

        [
          'scene:helium_balloon_model:helium_balloon_model.position',
          {
            nodeName: 'helium_balloon_model',
            objectName: undefined,
            objectIndex: undefined,
            propertyName: 'position',
            propertyIndex: undefined
          }
        ],

        [
          '急須.材料[零]',
          {
            nodeName: '急須',
            objectName: undefined,
            objectIndex: undefined,
            propertyName: '材料',
            propertyIndex: '零'
          }
        ],

        [
          '📦.🎨[🔴]',
          {
            nodeName: '📦',
            objectName: undefined,
            objectIndex: undefined,
            propertyName: '🎨',
            propertyIndex: '🔴'
          }
        ]
      ];

      // Parses track names correctly.
      paths.forEach(function (path) {
        expect(PropertyBinding.parseTrackName(path[0])).toEqual(path[1]);
      });
    });

    test.todo('findNode', () => {
      // implement
    });

    test.todo('BindingType', () => {
      // implement
    });

    test.todo('Versioning', () => {
      // implement
    });

    test.todo('GetterByBindingType', () => {
      // implement
    });

    test.todo('SetterByBindingTypeAndVersioning', () => {
      // implement
    });

    test.todo('getValue', () => {
      // implement
    });

    test('setValue', () => {
      const paths = ['.material.opacity', '.material[opacity]'];

      paths.forEach(function (path) {
        const originalValue = 0;
        const expectedValue = 1;

        const geometry = new BoxGeometry();
        const material = new MeshBasicMaterial();
        material.opacity = originalValue;
        const mesh = new Mesh(geometry, material);

        const binding = new PropertyBinding(mesh, path, null);
        binding.bind();

        // Sets property of material with (pre-setValue)
        expect(material.opacity).toEqual(originalValue);

        // 'Sets property of material with (post-setValue)'
        binding.setValue([expectedValue], 0);
        expect(material.opacity).toEqual(expectedValue);
      });
    });

    test.todo('bind', () => {
      // implement
    });

    test.todo('unbind', () => {
      // implement
    });
  });
});
