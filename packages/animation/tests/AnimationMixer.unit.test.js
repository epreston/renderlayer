import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';
import { one3, two3, zero3 } from './math-constants.js';

import { EventDispatcher, Object3D } from '@renderlayer/core';
import { VectorKeyframeTrack } from '@renderlayer/keyframes';
import { AnimationClip } from '../src/AnimationClip.js';
import { AnimationMixer } from '../src/AnimationMixer.js';

function getClips(pos1, pos2, scale1, scale2, dur) {
  const clips = [];

  let track = new VectorKeyframeTrack('.scale', [0, dur], [scale1.x, scale1.y, scale1.z, scale2.x, scale2.y, scale2.z]);
  clips.push(new AnimationClip('scale', dur, [track]));

  track = new VectorKeyframeTrack('.position', [0, dur], [pos1.x, pos1.y, pos1.z, pos2.x, pos2.y, pos2.z]);
  clips.push(new AnimationClip('position', dur, [track]));

  return clips;
}

describe('Animation', () => {
  describe('AnimationMixer', () => {
    test('Instancing', () => {
      const object = new AnimationMixer();
      expect(object).toBeDefined;
    });

    test('Extending', () => {
      const object = new AnimationMixer();
      expect(object).toBeInstanceOf(EventDispatcher);
    });

    test.todo('time', () => {
      // implement
    });

    test.todo('timeScale', () => {
      // implement
    });

    test.todo('clipAction', () => {
      // implement
    });

    test.todo('existingAction', () => {
      // implement
    });

    test('stopAllAction', () => {
      const obj = new Object3D();
      const animMixer = new AnimationMixer(obj);
      const clips = getClips(zero3, one3, two3, one3, 1);
      const actionA = animMixer.clipAction(clips[0]);
      const actionB = animMixer.clipAction(clips[1]);

      actionA.play();
      actionB.play();
      animMixer.update(0.1);
      animMixer.stopAllAction();

      // prettier-ignore
      expect(
        ! actionA.isRunning() &&
        ! actionB.isRunning()).toBeTruthy();

      // prettier-ignore
      expect(
        obj.position.x == 0 &&
        obj.position.y == 0 &&
        obj.position.z == 0
      ).toBeTruthy();

      // prettier-ignore
      expect(
        obj.scale.x == 1 &&
        obj.scale.y == 1 &&
        obj.scale.z == 1
      ).toBeTruthy();
    });

    test.todo('update', () => {
      // implement
    });

    test.todo('setTime', () => {
      // implement
    });

    test('getRoot', () => {
      const obj = new Object3D();
      const animMixer = new AnimationMixer(obj);
      expect(obj).toBe(animMixer.getRoot());
    });

    test.todo('uncacheClip', () => {
      // implement
    });

    test.todo('uncacheRoot', () => {
      // implement
    });

    test.todo('uncacheAction', () => {
      // implement
    });
  });
});
