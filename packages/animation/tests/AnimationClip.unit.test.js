import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { AnimationClip } from '../src/AnimationClip.js';

describe('Animation', () => {
  describe('AnimationClip', () => {
    test('Instancing', () => {
      const clip = new AnimationClip('clip1', 1000, [{}]);
      expect(clip).toBeTruthy();
    });

    test('name', () => {
      const clip = new AnimationClip('clip1', 1000, [{}]);
      expect(clip.name === 'clip1').toBeTruthy();
    });

    test.todo('tracks', () => {
      // implement
    });

    test.todo('duration', () => {
      // implement
    });

    test.todo('blendMode', () => {
      // implement
    });

    test('uuid', () => {
      const object = new AnimationClip('clip1', 1000, [{}]);

      expect(object.uuid).to.be.a('string');
      expect(object.uuid).to.have.length(36);
    });

    test.todo('parse', () => {
      // implement
    });

    test.todo('toJSON', () => {
      // static toJSON
      // implement
    });

    test.todo('CreateFromMorphTargetSequence', () => {
      // implement
    });

    test.todo('findByName', () => {
      // implement
    });

    test.todo('CreateClipsFromMorphTargetSequences', () => {
      // implement
    });

    test.todo('parseAnimation', () => {
      // implement
    });

    test.todo('resetDuration', () => {
      // implement
    });

    test.todo('trim', () => {
      // implement
    });

    test.todo('validate', () => {
      // implement
    });

    test.todo('optimize', () => {
      // implement
    });

    test.todo('clone', () => {
      // implement
    });

    test.todo('toJSON', () => {
      // member method toJSON
      // implement
    });
  });
});
