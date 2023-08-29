import { describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { NumberKeyframeTrack } from '@renderlayer/keyframes';
import { NormalAnimationBlendMode } from '@renderlayer/shared';

import { AnimationMixer } from '../src/AnimationMixer.js';
import { AnimationClip } from '../src/AnimationClip.js';

function createAnimation() {
  const root = new Object3D();
  const mixer = new AnimationMixer(root);
  const track = new NumberKeyframeTrack('.rotation[x]', [0, 1000], [0, 360]);
  const clip = new AnimationClip('clip1', 1000, [track]);

  const animationAction = mixer.clipAction(clip);
  return {
    root: root,
    mixer: mixer,
    track: track,
    clip: clip,
    animationAction: animationAction
  };
}

describe('Animation', () => {
  describe('AnimationClip', () => {
    test('constructor', () => {
      const clip = new AnimationClip('clip1', 1000, [{}]);
      expect(clip).toBeTruthy();
    });

    test('name', () => {
      const clip = new AnimationClip('clip1', 1000, [{}]);
      expect(clip.name).toBe('clip1');
    });

    test('tracks', () => {
      const { track, clip } = createAnimation();

      expect(clip.tracks.length).toBe(1);
      expect(clip.tracks[0]).toBe(track);
    });

    test('duration', () => {
      const { clip } = createAnimation();
      expect(clip.duration).toBe(1000);
    });

    test('blendMode', () => {
      const { clip } = createAnimation();
      expect(clip.blendMode).toBe(NormalAnimationBlendMode);
    });

    test('uuid', () => {
      const object = new AnimationClip('clip1', 1000, [{}]);

      expect(object.uuid).to.be.a('string');
      expect(object.uuid).to.have.length(36);
    });

    test('parse', () => {
      // static AnimationClip.parse(json)
      const clip = AnimationClip.parse({
        blendMode: 2500,
        duration: 1000,
        name: 'clip1',
        tracks: [
          {
            name: '.rotation[x]',
            times: [0, 1000],
            type: 'number',
            values: [0, 360]
          }
        ],
        uuid: '4425879c-8e69-4366-9da1-2b5bf9e0af41'
      });

      expect(clip).toBeInstanceOf(AnimationClip);
      expect(clip.name).toBe('clip1');
      expect(clip.tracks.length).toBe(1);
      expect(clip.duration).toBe(1000);
      expect(clip.blendMode).toBe(NormalAnimationBlendMode);
      expect(clip.uuid).to.have.length(36);
    });

    test('toJSON', () => {
      // static AnimationClip.toJSON(clip)
      const { clip } = createAnimation();
      clip.uuid = '4425879c-8e69-4366-9da1-2b5bf9e0af41';

      expect(AnimationClip.toJSON(clip)).toMatchInlineSnapshot(`
        {
          "blendMode": 2500,
          "duration": 1000,
          "name": "clip1",
          "tracks": [
            {
              "name": ".rotation[x]",
              "times": [
                0,
                1000,
              ],
              "type": "number",
              "values": [
                0,
                360,
              ],
            },
          ],
          "uuid": "4425879c-8e69-4366-9da1-2b5bf9e0af41",
        }
      `);
    });

    test.todo('CreateFromMorphTargetSequence', () => {
      // static AnimationClip.CreateFromMorphTargetSequence(name, morphTargetSequence, fps, noLoop)
      // implement
    });

    test.todo('findByName', () => {
      // static AnimationClip.findByName(objectOrClipArray, name)
      // implement
    });

    test.todo('CreateClipsFromMorphTargetSequences', () => {
      // static AnimationClip.CreateClipsFromMorphTargetSequences(morphTargets, fps, noLoop)
      // implement
    });

    test.todo('parseAnimation', () => {
      // static AnimationClip.parseAnimation(animation, bones)
      // implement
    });

    test('resetDuration', () => {
      const { clip } = createAnimation();
      const clip2 = clip.resetDuration();
      expect(clip).toBe(clip2);

      expect(clip.duration).toBe(1000);
    });

    test('trim', () => {
      const { clip } = createAnimation();
      const clip2 = clip.trim();
      expect(clip).toBe(clip2);

      // EP: test result ?
    });

    test('validate', () => {
      const { clip } = createAnimation();
      expect(clip.validate()).toBe(true);
    });

    test('optimize', () => {
      const { clip } = createAnimation();
      const clip2 = clip.optimize();
      expect(clip).toBe(clip2);

      // EP: test result ?
    });

    test('clone', () => {
      const { clip } = createAnimation();
      const clip2 = clip.clone();

      expect(clip2).toBeInstanceOf(AnimationClip);

      expect(clip2).not.toBe(clip);
      expect(clip2.uuid).not.toBe(clip.uuid);

      expect(clip2.name).toBe(clip.name);
      expect(clip2.tracks.length).toBe(clip.tracks.length);
      expect(clip2.duration).toBe(clip.duration);
      expect(clip2.blendMode).toBe(clip.blendMode);
    });

    test('toJSON', () => {
      // member method toJSON
      const { clip } = createAnimation();
      clip.uuid = '4425879c-8e69-4366-9da1-2b5bf9e0af41';

      expect(clip.toJSON()).toMatchInlineSnapshot(`
        {
          "blendMode": 2500,
          "duration": 1000,
          "name": "clip1",
          "tracks": [
            {
              "name": ".rotation[x]",
              "times": [
                0,
                1000,
              ],
              "type": "number",
              "values": [
                0,
                360,
              ],
            },
          ],
          "uuid": "4425879c-8e69-4366-9da1-2b5bf9e0af41",
        }
      `);
    });
  });
});
