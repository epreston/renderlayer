import { LoopRepeat, ZeroCurvatureEnding, NormalAnimationBlendMode, AdditiveAnimationBlendMode, LoopOnce, ZeroSlopeEnding, WrapAroundEnding, LoopPingPong } from '@renderlayer/shared';
import { KeyframeTrack, NumberKeyframeTrack, VectorKeyframeTrack, QuaternionKeyframeTrack, StringKeyframeTrack, BooleanKeyframeTrack, ColorKeyframeTrack } from '@renderlayer/keyframes';
import { Quaternion, generateUUID } from '@renderlayer/math';
import { EventDispatcher } from '@renderlayer/core';
import { LinearInterpolant } from '@renderlayer/interpolants';

class AnimationAction {
  #mixer;
  #clip;
  #localRoot = null;
  blendMode;
  #interpolantSettings;
  _interpolants;
  // bound by the mixer
  _propertyBindings;
  // inside: PropertyMixer (managed by the mixer)
  _cacheIndex = null;
  // for the memory manager
  _byClipCacheIndex = null;
  // for the memory manager
  #timeScaleInterpolant = null;
  #weightInterpolant = null;
  loop = LoopRepeat;
  #loopCount = -1;
  // global mixer time when the action is to be started
  // it's set back to 'null' upon start of the action
  #startTime = null;
  // scaled local time of the action
  // gets clamped or wrapped to 0..clip.duration according to loop
  time = 0;
  timeScale = 1;
  #effectiveTimeScale = 1;
  weight = 1;
  #effectiveWeight = 1;
  repetitions = Infinity;
  // no. of repetitions when looping
  paused = false;
  // true -> zero effective time scale
  enabled = true;
  // false -> zero effective weight
  clampWhenFinished = false;
  // keep feeding the last frame?
  zeroSlopeAtStart = true;
  // for smooth interpolation w/o separate
  zeroSlopeAtEnd = true;
  // clips for start, loop and end
  constructor(mixer, clip, localRoot = null, blendMode = clip.blendMode) {
    this.#mixer = mixer;
    this.#clip = clip;
    this.#localRoot = localRoot;
    this.blendMode = blendMode;
    const tracks = clip.tracks;
    const nTracks = tracks.length;
    const interpolants = new Array(nTracks);
    const interpolantSettings = {
      endingStart: ZeroCurvatureEnding,
      endingEnd: ZeroCurvatureEnding
    };
    for (let i = 0; i !== nTracks; ++i) {
      const interpolant = tracks[i].createInterpolant(null);
      interpolants[i] = interpolant;
      interpolant.settings = interpolantSettings;
    }
    this.#interpolantSettings = interpolantSettings;
    this._interpolants = interpolants;
    this._propertyBindings = new Array(nTracks);
  }
  // State & Scheduling
  play() {
    this.#mixer._activateAction(this);
    return this;
  }
  stop() {
    this.#mixer._deactivateAction(this);
    return this.reset();
  }
  reset() {
    this.paused = false;
    this.enabled = true;
    this.time = 0;
    this.#loopCount = -1;
    this.#startTime = null;
    return this.stopFading().stopWarping();
  }
  isRunning() {
    return this.enabled && !this.paused && this.timeScale !== 0 && this.#startTime === null && this.#mixer._isActiveAction(this);
  }
  // return true when play has been called
  isScheduled() {
    return this.#mixer._isActiveAction(this);
  }
  startAt(time) {
    this.#startTime = time;
    return this;
  }
  setLoop(mode, repetitions) {
    this.loop = mode;
    this.repetitions = repetitions;
    return this;
  }
  // Weight
  // set the weight stopping any scheduled fading
  // although .enabled = false yields an effective weight of zero, this
  // method does *not* change .enabled, because it would be confusing
  setEffectiveWeight(weight) {
    this.weight = weight;
    this.#effectiveWeight = this.enabled ? weight : 0;
    return this.stopFading();
  }
  // return the weight considering fading and .enabled
  getEffectiveWeight() {
    return this.#effectiveWeight;
  }
  fadeIn(duration) {
    return this.#scheduleFading(duration, 0, 1);
  }
  fadeOut(duration) {
    return this.#scheduleFading(duration, 1, 0);
  }
  crossFadeFrom(fadeOutAction, duration, warp) {
    fadeOutAction.fadeOut(duration);
    this.fadeIn(duration);
    if (warp) {
      const fadeInDuration = this.#clip.duration;
      const fadeOutDuration = fadeOutAction.getClip().duration;
      const startEndRatio = fadeOutDuration / fadeInDuration;
      const endStartRatio = fadeInDuration / fadeOutDuration;
      fadeOutAction.warp(1, startEndRatio, duration);
      this.warp(endStartRatio, 1, duration);
    }
    return this;
  }
  crossFadeTo(fadeInAction, duration, warp) {
    return fadeInAction.crossFadeFrom(this, duration, warp);
  }
  stopFading() {
    const weightInterpolant = this.#weightInterpolant;
    if (weightInterpolant !== null) {
      this.#weightInterpolant = null;
      this.#mixer._takeBackControlInterpolant(weightInterpolant);
    }
    return this;
  }
  // Time Scale Control
  // set the time scale stopping any scheduled warping
  // although .paused = true yields an effective time scale of zero, this
  // method does *not* change .paused, because it would be confusing
  setEffectiveTimeScale(timeScale) {
    this.timeScale = timeScale;
    this.#effectiveTimeScale = this.paused ? 0 : timeScale;
    return this.stopWarping();
  }
  // return the time scale considering warping and .paused
  getEffectiveTimeScale() {
    this.#effectiveTimeScale = this.paused ? 0 : this.#effectiveTimeScale;
    return this.#effectiveTimeScale;
  }
  setDuration(duration) {
    this.timeScale = this.#clip.duration / duration;
    return this.stopWarping();
  }
  syncWith(action) {
    this.time = action.time;
    this.timeScale = action.timeScale;
    return this.stopWarping();
  }
  halt(duration) {
    return this.warp(this.#effectiveTimeScale, 0, duration);
  }
  warp(startTimeScale, endTimeScale, duration) {
    const mixer = this.#mixer;
    const now = mixer.time;
    const timeScale = this.timeScale;
    let interpolant = this.#timeScaleInterpolant;
    if (interpolant === null) {
      interpolant = mixer._lendControlInterpolant();
      this.#timeScaleInterpolant = interpolant;
    }
    const times = interpolant.parameterPositions;
    const values = interpolant.sampleValues;
    times[0] = now;
    times[1] = now + duration;
    values[0] = startTimeScale / timeScale;
    values[1] = endTimeScale / timeScale;
    return this;
  }
  stopWarping() {
    const timeScaleInterpolant = this.#timeScaleInterpolant;
    if (timeScaleInterpolant !== null) {
      this.#timeScaleInterpolant = null;
      this.#mixer._takeBackControlInterpolant(timeScaleInterpolant);
    }
    return this;
  }
  // Object Accessors
  getMixer() {
    return this.#mixer;
  }
  getClip() {
    return this.#clip;
  }
  getRoot() {
    return this.#localRoot || this.#mixer.getRoot();
  }
  get localRoot() {
    return this.#localRoot;
  }
  // Internal
  _update(time, deltaTime, timeDirection, accuIndex) {
    if (!this.enabled) {
      this.#updateWeight(time);
      return;
    }
    const startTime = this.#startTime;
    if (startTime !== null) {
      const timeRunning = (time - startTime) * timeDirection;
      if (timeRunning < 0 || timeDirection === 0) {
        deltaTime = 0;
      } else {
        this.#startTime = null;
        deltaTime = timeDirection * timeRunning;
      }
    }
    deltaTime *= this.#updateTimeScale(time);
    const clipTime = this.#updateTime(deltaTime);
    const weight = this.#updateWeight(time);
    if (weight > 0) {
      const interpolants = this._interpolants;
      const propertyMixers = this._propertyBindings;
      switch (this.blendMode) {
        case AdditiveAnimationBlendMode:
          for (let j = 0, m = interpolants.length; j !== m; ++j) {
            interpolants[j].evaluate(clipTime);
            propertyMixers[j].accumulateAdditive(weight);
          }
          break;
        case NormalAnimationBlendMode:
        default:
          for (let j = 0, m = interpolants.length; j !== m; ++j) {
            interpolants[j].evaluate(clipTime);
            propertyMixers[j].accumulate(accuIndex, weight);
          }
      }
    }
  }
  #updateWeight(time) {
    let weight = 0;
    if (this.enabled) {
      weight = this.weight;
      const interpolant = this.#weightInterpolant;
      if (interpolant !== null) {
        const interpolantValue = interpolant.evaluate(time)[0];
        weight *= interpolantValue;
        if (time > interpolant.parameterPositions[1]) {
          this.stopFading();
          if (interpolantValue === 0) {
            this.enabled = false;
          }
        }
      }
    }
    this.#effectiveWeight = weight;
    return weight;
  }
  #updateTimeScale(time) {
    let timeScale = 0;
    if (!this.paused) {
      timeScale = this.timeScale;
      const interpolant = this.#timeScaleInterpolant;
      if (interpolant !== null) {
        const interpolantValue = interpolant.evaluate(time)[0];
        timeScale *= interpolantValue;
        if (time > interpolant.parameterPositions[1]) {
          this.stopWarping();
          if (timeScale === 0) {
            this.paused = true;
          } else {
            this.timeScale = timeScale;
          }
        }
      }
    }
    this.#effectiveTimeScale = timeScale;
    return timeScale;
  }
  #updateTime(deltaTime) {
    const duration = this.#clip.duration;
    const loop = this.loop;
    let time = this.time + deltaTime;
    let loopCount = this.#loopCount;
    const pingPong = loop === LoopPingPong;
    if (deltaTime === 0) {
      if (loopCount === -1) return time;
      return pingPong && (loopCount & 1) === 1 ? duration - time : time;
    }
    if (loop === LoopOnce) {
      if (loopCount === -1) {
        this.#loopCount = 0;
        this.#setEndings(true, true, false);
      }
      handle_stop: {
        if (time >= duration) {
          time = duration;
        } else if (time < 0) {
          time = 0;
        } else {
          this.time = time;
          break handle_stop;
        }
        if (this.clampWhenFinished) this.paused = true;
        else this.enabled = false;
        this.time = time;
        this.#mixer.dispatchEvent({
          type: "finished",
          action: this,
          direction: deltaTime < 0 ? -1 : 1
        });
      }
    } else {
      if (loopCount === -1) {
        if (deltaTime >= 0) {
          loopCount = 0;
          this.#setEndings(true, this.repetitions === 0, pingPong);
        } else {
          this.#setEndings(this.repetitions === 0, true, pingPong);
        }
      }
      if (time >= duration || time < 0) {
        const loopDelta = Math.floor(time / duration);
        time -= duration * loopDelta;
        loopCount += Math.abs(loopDelta);
        const pending = this.repetitions - loopCount;
        if (pending <= 0) {
          if (this.clampWhenFinished) this.paused = true;
          else this.enabled = false;
          time = deltaTime > 0 ? duration : 0;
          this.time = time;
          this.#mixer.dispatchEvent({
            type: "finished",
            action: this,
            direction: deltaTime > 0 ? 1 : -1
          });
        } else {
          if (pending === 1) {
            const atStart = deltaTime < 0;
            this.#setEndings(atStart, !atStart, pingPong);
          } else {
            this.#setEndings(false, false, pingPong);
          }
          this.#loopCount = loopCount;
          this.time = time;
          this.#mixer.dispatchEvent({
            type: "loop",
            action: this,
            loopDelta
          });
        }
      } else {
        this.time = time;
      }
      if (pingPong && (loopCount & 1) === 1) {
        return duration - time;
      }
    }
    return time;
  }
  #setEndings(atStart, atEnd, pingPong) {
    const settings = this.#interpolantSettings;
    if (pingPong) {
      settings.endingStart = ZeroSlopeEnding;
      settings.endingEnd = ZeroSlopeEnding;
    } else {
      if (atStart) {
        settings.endingStart = this.zeroSlopeAtStart ? ZeroSlopeEnding : ZeroCurvatureEnding;
      } else {
        settings.endingStart = WrapAroundEnding;
      }
      if (atEnd) {
        settings.endingEnd = this.zeroSlopeAtEnd ? ZeroSlopeEnding : ZeroCurvatureEnding;
      } else {
        settings.endingEnd = WrapAroundEnding;
      }
    }
  }
  #scheduleFading(duration, weightNow, weightThen) {
    const mixer = this.#mixer;
    const now = mixer.time;
    let interpolant = this.#weightInterpolant;
    if (interpolant === null) {
      interpolant = mixer._lendControlInterpolant();
      this.#weightInterpolant = interpolant;
    }
    const times = interpolant.parameterPositions;
    const values = interpolant.sampleValues;
    times[0] = now;
    values[0] = weightNow;
    times[1] = now + duration;
    values[1] = weightThen;
    return this;
  }
}

function convertArray(array, type, forceClone) {
  if (!array || // let 'undefined' and 'null' pass
  array.constructor === type)
    return array;
  if (typeof type.BYTES_PER_ELEMENT === "number") {
    return new type(array);
  }
  return Array.prototype.slice.call(array);
}
function getKeyframeOrder(times) {
  function compareTime(a, b) {
    return times[a] - times[b];
  }
  const n = times.length;
  const result = new Array(n);
  for (let i = 0; i !== n; ++i) result[i] = i;
  result.sort(compareTime);
  return result;
}
function sortedArray(values, stride, order) {
  const nValues = values.length;
  const result = new values.constructor(nValues);
  for (let i = 0, dstOffset = 0; dstOffset !== nValues; ++i) {
    const srcOffset = order[i] * stride;
    for (let j = 0; j !== stride; ++j) {
      result[dstOffset++] = values[srcOffset + j];
    }
  }
  return result;
}
function flattenJSON(jsonKeys, times, values, valuePropertyName) {
  let i = 1;
  let key = jsonKeys[0];
  while (key !== void 0 && key[valuePropertyName] === void 0) {
    key = jsonKeys[i++];
  }
  if (key === void 0) return;
  let value = key[valuePropertyName];
  if (value === void 0) return;
  if (Array.isArray(value)) {
    do {
      value = key[valuePropertyName];
      if (value !== void 0) {
        times.push(key.time);
        values.push(...value);
      }
      key = jsonKeys[i++];
    } while (key !== void 0);
  } else if (value.toArray !== void 0) {
    do {
      value = key[valuePropertyName];
      if (value !== void 0) {
        times.push(key.time);
        value.toArray(values, values.length);
      }
      key = jsonKeys[i++];
    } while (key !== void 0);
  } else {
    do {
      value = key[valuePropertyName];
      if (value !== void 0) {
        times.push(key.time);
        values.push(value);
      }
      key = jsonKeys[i++];
    } while (key !== void 0);
  }
}
function subclip(sourceClip, name, startFrame, endFrame, fps = 30) {
  const clip = sourceClip.clone();
  clip.name = name;
  const tracks = [];
  for (const track of clip.tracks) {
    const valueSize = track.getValueSize();
    const times = [];
    const values = [];
    for (let j = 0; j < track.times.length; ++j) {
      const frame = track.times[j] * fps;
      if (frame < startFrame || frame >= endFrame) continue;
      times.push(track.times[j]);
      for (let k = 0; k < valueSize; ++k) {
        values.push(track.values[j * valueSize + k]);
      }
    }
    if (times.length === 0) continue;
    track.times = convertArray(times, track.times.constructor);
    track.values = convertArray(values, track.values.constructor);
    tracks.push(track);
  }
  clip.tracks = tracks;
  let minStartTime = Infinity;
  for (let i = 0; i < clip.tracks.length; ++i) {
    if (minStartTime > clip.tracks[i].times[0]) {
      minStartTime = clip.tracks[i].times[0];
    }
  }
  for (let i = 0; i < clip.tracks.length; ++i) {
    clip.tracks[i].shift(-1 * minStartTime);
  }
  clip.resetDuration();
  return clip;
}
function makeClipAdditive(targetClip, referenceFrame = 0, referenceClip = targetClip, fps = 30) {
  if (fps <= 0) fps = 30;
  const numTracks = referenceClip.tracks.length;
  const referenceTime = referenceFrame / fps;
  for (let i = 0; i < numTracks; ++i) {
    const referenceTrack = referenceClip.tracks[i];
    const referenceTrackType = referenceTrack.ValueTypeName;
    if (referenceTrackType === "bool" || referenceTrackType === "string") continue;
    const targetTrack = targetClip.tracks.find((track) => {
      return track.name === referenceTrack.name && track.ValueTypeName === referenceTrackType;
    });
    if (targetTrack === void 0) continue;
    let referenceOffset = 0;
    const referenceValueSize = referenceTrack.getValueSize();
    if (referenceTrack.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline) {
      referenceOffset = referenceValueSize / 3;
    }
    let targetOffset = 0;
    const targetValueSize = targetTrack.getValueSize();
    if (targetTrack.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline) {
      targetOffset = targetValueSize / 3;
    }
    const lastIndex = referenceTrack.times.length - 1;
    let referenceValue;
    if (referenceTime <= referenceTrack.times[0]) {
      const startIndex = referenceOffset;
      const endIndex = referenceValueSize - referenceOffset;
      referenceValue = referenceTrack.values.slice(startIndex, endIndex);
    } else if (referenceTime >= referenceTrack.times[lastIndex]) {
      const startIndex = lastIndex * referenceValueSize + referenceOffset;
      const endIndex = startIndex + referenceValueSize - referenceOffset;
      referenceValue = referenceTrack.values.slice(startIndex, endIndex);
    } else {
      const interpolant = referenceTrack.createInterpolant();
      const startIndex = referenceOffset;
      const endIndex = referenceValueSize - referenceOffset;
      interpolant.evaluate(referenceTime);
      referenceValue = interpolant.resultBuffer.slice(startIndex, endIndex);
    }
    if (referenceTrackType === "quaternion") {
      const referenceQuat = new Quaternion().fromArray(referenceValue).normalize().conjugate();
      referenceQuat.toArray(referenceValue);
    }
    const numTimes = targetTrack.times.length;
    for (let j = 0; j < numTimes; ++j) {
      const valueStart = j * targetValueSize + targetOffset;
      if (referenceTrackType === "quaternion") {
        Quaternion.multiplyQuaternionsFlat(
          targetTrack.values,
          valueStart,
          referenceValue,
          0,
          targetTrack.values,
          valueStart
        );
      } else {
        const valueEnd = targetValueSize - targetOffset * 2;
        for (let k = 0; k < valueEnd; ++k) {
          targetTrack.values[valueStart + k] -= referenceValue[k];
        }
      }
    }
  }
  targetClip.blendMode = AdditiveAnimationBlendMode;
  return targetClip;
}

class AnimationClip {
  name;
  tracks;
  duration = -1;
  blendMode = NormalAnimationBlendMode;
  uuid = generateUUID();
  constructor(name, duration = -1, tracks, blendMode = NormalAnimationBlendMode) {
    this.name = name;
    this.tracks = tracks;
    this.duration = duration;
    this.blendMode = blendMode;
    if (this.duration < 0) {
      this.resetDuration();
    }
  }
  static parse(json) {
    const tracks = [];
    const jsonTracks = json.tracks;
    const frameTime = 1 / (json.fps || 1);
    for (let i = 0, n = jsonTracks.length; i !== n; ++i) {
      tracks.push(_parseKeyframeTrack(jsonTracks[i]).scale(frameTime));
    }
    const clip = new this(json.name, json.duration, tracks, json.blendMode);
    clip.uuid = json.uuid;
    return clip;
  }
  static toJSON(clip) {
    const tracks = [];
    const clipTracks = clip.tracks;
    const json = {
      name: clip.name,
      duration: clip.duration,
      tracks,
      uuid: clip.uuid,
      blendMode: clip.blendMode
    };
    for (let i = 0, n = clipTracks.length; i !== n; ++i) {
      tracks.push(KeyframeTrack.toJSON(clipTracks[i]));
    }
    return json;
  }
  static CreateFromMorphTargetSequence(name, morphTargetSequence, fps, noLoop) {
    const numMorphTargets = morphTargetSequence.length;
    const tracks = [];
    for (let i = 0; i < numMorphTargets; i++) {
      let times = [];
      let values = [];
      times.push((i + numMorphTargets - 1) % numMorphTargets, i, (i + 1) % numMorphTargets);
      values.push(0, 1, 0);
      const order = getKeyframeOrder(times);
      times = sortedArray(times, 1, order);
      values = sortedArray(values, 1, order);
      if (!noLoop && times[0] === 0) {
        times.push(numMorphTargets);
        values.push(values[0]);
      }
      tracks.push(
        new NumberKeyframeTrack(
          `.morphTargetInfluences[${morphTargetSequence[i].name}]`,
          times,
          values
        ).scale(1 / fps)
      );
    }
    return new this(name, -1, tracks);
  }
  static findByName(objectOrClipArray, name) {
    let clipArray = objectOrClipArray;
    if (!Array.isArray(objectOrClipArray)) {
      const o = objectOrClipArray;
      clipArray = o.geometry && o.geometry.animations || o.animations;
    }
    for (let i = 0; i < clipArray.length; i++) {
      if (clipArray[i].name === name) {
        return clipArray[i];
      }
    }
    return null;
  }
  static CreateClipsFromMorphTargetSequences(morphTargets, fps, noLoop) {
    const animationToMorphTargets = {};
    const pattern = /^([\w-]*?)([\d]+)$/;
    for (let i = 0, il = morphTargets.length; i < il; i++) {
      const morphTarget = morphTargets[i];
      const parts = morphTarget.name.match(pattern);
      if (parts && parts.length > 1) {
        const name = parts[1];
        let animationMorphTargets = animationToMorphTargets[name];
        if (!animationMorphTargets) {
          animationToMorphTargets[name] = animationMorphTargets = [];
        }
        animationMorphTargets.push(morphTarget);
      }
    }
    const clips = [];
    for (const name in animationToMorphTargets) {
      clips.push(
        this.CreateFromMorphTargetSequence(name, animationToMorphTargets[name], fps, noLoop)
      );
    }
    return clips;
  }
  // parse the animation.hierarchy format
  static parseAnimation(animation, bones) {
    if (!animation) {
      console.error("AnimationClip: No animation in JSONLoader data.");
      return null;
    }
    const addNonemptyTrack = (trackType, trackName, animationKeys, propertyName, destTracks) => {
      if (animationKeys.length !== 0) {
        const times = [];
        const values = [];
        flattenJSON(animationKeys, times, values, propertyName);
        if (times.length !== 0) {
          destTracks.push(new trackType(trackName, times, values));
        }
      }
    };
    const tracks = [];
    const clipName = animation.name || "default";
    const fps = animation.fps || 30;
    const blendMode = animation.blendMode;
    let duration = animation.length || -1;
    const hierarchyTracks = animation.hierarchy || [];
    for (let h = 0; h < hierarchyTracks.length; h++) {
      const animationKeys = hierarchyTracks[h].keys;
      if (!animationKeys || animationKeys.length === 0) continue;
      if (animationKeys[0].morphTargets) {
        const morphTargetNames = {};
        let k;
        for (k = 0; k < animationKeys.length; k++) {
          if (animationKeys[k].morphTargets) {
            for (let m = 0; m < animationKeys[k].morphTargets.length; m++) {
              morphTargetNames[animationKeys[k].morphTargets[m]] = -1;
            }
          }
        }
        for (const morphTargetName in morphTargetNames) {
          const times = [];
          const values = [];
          for (let m = 0; m !== animationKeys[k].morphTargets.length; ++m) {
            const animationKey = animationKeys[k];
            times.push(animationKey.time);
            values.push(animationKey.morphTarget === morphTargetName ? 1 : 0);
          }
          tracks.push(
            new NumberKeyframeTrack(`.morphTargetInfluence[${morphTargetName}]`, times, values)
          );
        }
        duration = morphTargetNames.length * fps;
      } else {
        const boneName = `.bones[${bones[h].name}]`;
        addNonemptyTrack(VectorKeyframeTrack, `${boneName}.position`, animationKeys, "pos", tracks);
        addNonemptyTrack(
          QuaternionKeyframeTrack,
          `${boneName}.quaternion`,
          animationKeys,
          "rot",
          tracks
        );
        addNonemptyTrack(VectorKeyframeTrack, `${boneName}.scale`, animationKeys, "scl", tracks);
      }
    }
    if (tracks.length === 0) {
      return null;
    }
    const clip = new this(clipName, duration, tracks, blendMode);
    return clip;
  }
  resetDuration() {
    const tracks = this.tracks;
    let duration = 0;
    for (let i = 0, n = tracks.length; i !== n; ++i) {
      const track = this.tracks[i];
      duration = Math.max(duration, track.times[track.times.length - 1]);
    }
    this.duration = duration;
    return this;
  }
  trim() {
    for (let i = 0; i < this.tracks.length; i++) {
      this.tracks[i].trim(0, this.duration);
    }
    return this;
  }
  validate() {
    let valid = true;
    for (let i = 0; i < this.tracks.length; i++) {
      valid = valid && this.tracks[i].validate();
    }
    return valid;
  }
  optimize() {
    for (let i = 0; i < this.tracks.length; i++) {
      this.tracks[i].optimize();
    }
    return this;
  }
  /** @returns {this} */
  clone() {
    const tracks = [];
    for (let i = 0; i < this.tracks.length; i++) {
      tracks.push(this.tracks[i].clone());
    }
    return new this.constructor(this.name, this.duration, tracks, this.blendMode);
  }
  toJSON() {
    return this.constructor.toJSON(this);
  }
}
function _getTrackTypeForValueTypeName(typeName) {
  switch (typeName.toLowerCase()) {
    case "scalar":
    case "double":
    case "float":
    case "number":
    case "integer":
      return NumberKeyframeTrack;
    case "vector":
    case "vector2":
    case "vector3":
    case "vector4":
      return VectorKeyframeTrack;
    case "color":
      return ColorKeyframeTrack;
    case "quaternion":
      return QuaternionKeyframeTrack;
    case "bool":
    case "boolean":
      return BooleanKeyframeTrack;
    case "string":
      return StringKeyframeTrack;
  }
  throw new Error(`KeyframeTrack: unsupported typeName: ${typeName}`);
}
function _parseKeyframeTrack(json) {
  if (json.type === void 0) {
    throw new Error("KeyframeTrack: can not parse track type: undefined");
  }
  const trackType = _getTrackTypeForValueTypeName(json.type);
  if (json.times === void 0) {
    const times = [];
    const values = [];
    flattenJSON(json.keys, times, values, "value");
    json.times = times;
    json.values = values;
  }
  if (trackType.parse !== void 0) {
    return trackType.parse(json);
  } else {
    return new trackType(json.name, json.times, json.values, json.interpolation);
  }
}

class Composite {
  // support for AnimationObjectGroup
  #targetGroup;
  #bindings;
  constructor(targetGroup, path, optionalParsedPath) {
    const parsedPath = optionalParsedPath || PropertyBinding.parseTrackName(path);
    this._targetGroup = targetGroup;
    this.#bindings = targetGroup.subscribe_(path, parsedPath);
  }
  getValue(array, offset) {
    this.bind();
    const firstValidIndex = this.#targetGroup.nCachedObjects_;
    const binding = this.#bindings[firstValidIndex];
    if (binding !== void 0) binding.getValue(array, offset);
  }
  setValue(array, offset) {
    const bindings = this.#bindings;
    for (let i = this.#targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i) {
      bindings[i].setValue(array, offset);
    }
  }
  bind() {
    const bindings = this.#bindings;
    for (let i = this.#targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i) {
      bindings[i].bind();
    }
  }
  unbind() {
    const bindings = this.#bindings;
    for (let i = this.#targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i) {
      bindings[i].unbind();
    }
  }
}
class PropertyBinding {
  path;
  parsedPath;
  node;
  rootNode;
  getValue;
  setValue;
  static Composite = Composite;
  // prettier-ignore
  #BindingType = {
    Direct: 0,
    EntireArray: 1,
    ArrayElement: 2,
    HasFromToArray: 3
  };
  // prettier-ignore
  #Versioning = {
    None: 0,
    NeedsUpdate: 1,
    MatrixWorldNeedsUpdate: 2
  };
  #GetterByBindingType = [
    this.#getValue_direct,
    this.#getValue_array,
    this.#getValue_arrayElement,
    this.#getValue_toArray
  ];
  #SetterByBindingTypeAndVersioning = [
    [
      // Direct
      this.#setValue_direct,
      this.#setValue_direct_setNeedsUpdate,
      this.#setValue_direct_setMatrixWorldNeedsUpdate
    ],
    [
      // EntireArray
      this.#setValue_array,
      this.#setValue_array_setNeedsUpdate,
      this.#setValue_array_setMatrixWorldNeedsUpdate
    ],
    [
      // ArrayElement
      this.#setValue_arrayElement,
      this.#setValue_arrayElement_setNeedsUpdate,
      this.#setValue_arrayElement_setMatrixWorldNeedsUpdate
    ],
    [
      // HasToFromArray
      this.#setValue_fromArray,
      this.#setValue_fromArray_setNeedsUpdate,
      this.#setValue_fromArray_setMatrixWorldNeedsUpdate
    ]
  ];
  constructor(rootNode, path, parsedPath) {
    this.path = path;
    this.parsedPath = parsedPath || PropertyBinding.parseTrackName(path);
    this.node = PropertyBinding.findNode(rootNode, this.parsedPath.nodeName);
    this.rootNode = rootNode;
    this.getValue = this.#getValue_unbound;
    this.setValue = this.#setValue_unbound;
  }
  /** @returns {PropertyBinding | Composite} */
  static create(root, path, parsedPath) {
    if (!(root && root.isAnimationObjectGroup)) {
      return new PropertyBinding(root, path, parsedPath);
    } else {
      return new PropertyBinding.Composite(root, path, parsedPath);
    }
  }
  /**
   * Replaces spaces with underscores and removes unsupported characters from
   * node names, to ensure compatibility with parseTrackName().
   *
   * @param {string} name Node name to be sanitized.
   * @return {string}
   */
  static sanitizeNodeName(name) {
    return name.replace(/\s/g, "_").replace(_reservedRe, "");
  }
  static parseTrackName(trackName) {
    const matches = _trackRe.exec(trackName);
    if (matches === null) {
      throw new Error(`PropertyBinding: Cannot parse trackName: ${trackName}`);
    }
    const results = {
      // directoryName: matches[ 1 ], // currently unused
      nodeName: matches[2],
      objectName: matches[3],
      objectIndex: matches[4],
      propertyName: matches[5],
      // required
      propertyIndex: matches[6]
    };
    const lastDot = results.nodeName && results.nodeName.lastIndexOf(".");
    if (lastDot !== void 0 && lastDot !== -1) {
      const objectName = results.nodeName.substring(lastDot + 1);
      if (_supportedObjectNames.includes(objectName)) {
        results.nodeName = results.nodeName.substring(0, lastDot);
        results.objectName = objectName;
      }
    }
    if (results.propertyName === null || results.propertyName.length === 0) {
      throw new Error(`PropertyBinding: can not parse propertyName from trackName: ${trackName}`);
    }
    return results;
  }
  static findNode(root, nodeName) {
    if (nodeName === void 0 || nodeName === "" || nodeName === "." || nodeName === -1 || nodeName === root.name || nodeName === root.uuid) {
      return root;
    }
    if (root.skeleton) {
      const bone = root.skeleton.getBoneByName(nodeName);
      if (bone !== void 0) {
        return bone;
      }
    }
    if (root.children) {
      const searchNodeSubtree = (children) => {
        for (const childNode of children) {
          if (childNode.name === nodeName || childNode.uuid === nodeName) {
            return childNode;
          }
          const result = searchNodeSubtree(childNode.children);
          if (result) return result;
        }
        return null;
      };
      const subTreeNode = searchNodeSubtree(root.children);
      if (subTreeNode) {
        return subTreeNode;
      }
    }
    return null;
  }
  // these are used to "bind" a non-existent property
  #getValue_unavailable() {
  }
  #setValue_unavailable() {
  }
  // Getters
  #getValue_direct(buffer, offset) {
    buffer[offset] = this.targetObject[this.propertyName];
  }
  #getValue_array(buffer, offset) {
    const source = this.resolvedProperty;
    for (let i = 0, n = source.length; i !== n; ++i) {
      buffer[offset++] = source[i];
    }
  }
  #getValue_arrayElement(buffer, offset) {
    buffer[offset] = this.resolvedProperty[this.propertyIndex];
  }
  #getValue_toArray(buffer, offset) {
    this.resolvedProperty.toArray(buffer, offset);
  }
  // Direct
  #setValue_direct(buffer, offset) {
    this.targetObject[this.propertyName] = buffer[offset];
  }
  #setValue_direct_setNeedsUpdate(buffer, offset) {
    this.targetObject[this.propertyName] = buffer[offset];
    this.targetObject.needsUpdate = true;
  }
  #setValue_direct_setMatrixWorldNeedsUpdate(buffer, offset) {
    this.targetObject[this.propertyName] = buffer[offset];
    this.targetObject.matrixWorldNeedsUpdate = true;
  }
  // EntireArray
  #setValue_array(buffer, offset) {
    const dest = this.resolvedProperty;
    for (let i = 0, n = dest.length; i !== n; ++i) {
      dest[i] = buffer[offset++];
    }
  }
  #setValue_array_setNeedsUpdate(buffer, offset) {
    const dest = this.resolvedProperty;
    for (let i = 0, n = dest.length; i !== n; ++i) {
      dest[i] = buffer[offset++];
    }
    this.targetObject.needsUpdate = true;
  }
  #setValue_array_setMatrixWorldNeedsUpdate(buffer, offset) {
    const dest = this.resolvedProperty;
    for (let i = 0, n = dest.length; i !== n; ++i) {
      dest[i] = buffer[offset++];
    }
    this.targetObject.matrixWorldNeedsUpdate = true;
  }
  // ArrayElement
  #setValue_arrayElement(buffer, offset) {
    this.resolvedProperty[this.propertyIndex] = buffer[offset];
  }
  #setValue_arrayElement_setNeedsUpdate(buffer, offset) {
    this.resolvedProperty[this.propertyIndex] = buffer[offset];
    this.targetObject.needsUpdate = true;
  }
  #setValue_arrayElement_setMatrixWorldNeedsUpdate(buffer, offset) {
    this.resolvedProperty[this.propertyIndex] = buffer[offset];
    this.targetObject.matrixWorldNeedsUpdate = true;
  }
  // HasToFromArray
  #setValue_fromArray(buffer, offset) {
    this.resolvedProperty.fromArray(buffer, offset);
  }
  #setValue_fromArray_setNeedsUpdate(buffer, offset) {
    this.resolvedProperty.fromArray(buffer, offset);
    this.targetObject.needsUpdate = true;
  }
  #setValue_fromArray_setMatrixWorldNeedsUpdate(buffer, offset) {
    this.resolvedProperty.fromArray(buffer, offset);
    this.targetObject.matrixWorldNeedsUpdate = true;
  }
  #getValue_unbound(targetArray, offset) {
    this.bind();
    this.getValue(targetArray, offset);
  }
  #setValue_unbound(sourceArray, offset) {
    this.bind();
    this.setValue(sourceArray, offset);
  }
  // create getter / setter pair for a property in the scene graph
  bind() {
    let targetObject = this.node;
    const parsedPath = this.parsedPath;
    const objectName = parsedPath.objectName;
    const propertyName = parsedPath.propertyName;
    let propertyIndex = parsedPath.propertyIndex;
    if (!targetObject) {
      targetObject = PropertyBinding.findNode(this.rootNode, parsedPath.nodeName);
      this.node = targetObject;
    }
    this.getValue = this.#getValue_unavailable;
    this.setValue = this.#setValue_unavailable;
    if (!targetObject) {
      console.error(`PropertyBinding: No target node found for track: ${this.path}.`);
      return;
    }
    if (objectName) {
      let objectIndex = parsedPath.objectIndex;
      switch (objectName) {
        case "materials":
          if (!targetObject.material) {
            console.error(
              "PropertyBinding: Can not bind to material as node does not have a material.",
              this
            );
            return;
          }
          if (!targetObject.material.materials) {
            console.error(
              "PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",
              this
            );
            return;
          }
          targetObject = targetObject.material.materials;
          break;
        case "bones":
          if (!targetObject.skeleton) {
            console.error(
              "PropertyBinding: Can not bind to bones as node does not have a skeleton.",
              this
            );
            return;
          }
          targetObject = targetObject.skeleton.bones;
          for (let i = 0; i < targetObject.length; i++) {
            if (targetObject[i].name === objectIndex) {
              objectIndex = i;
              break;
            }
          }
          break;
        case "map":
          if ("map" in targetObject) {
            targetObject = targetObject.map;
            break;
          }
          if (!targetObject.material) {
            console.error(
              "PropertyBinding: Can not bind to material as node does not have a material.",
              this
            );
            return;
          }
          if (!targetObject.material.map) {
            console.error(
              "PropertyBinding: Can not bind to material.map as node.material does not have a map.",
              this
            );
            return;
          }
          targetObject = targetObject.material.map;
          break;
        default:
          if (targetObject[objectName] === void 0) {
            console.error("PropertyBinding: Can not bind to objectName of node undefined.", this);
            return;
          }
          targetObject = targetObject[objectName];
      }
      if (objectIndex !== void 0) {
        if (targetObject[objectIndex] === void 0) {
          console.error(
            "PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",
            this,
            targetObject
          );
          return;
        }
        targetObject = targetObject[objectIndex];
      }
    }
    const nodeProperty = targetObject[propertyName];
    if (nodeProperty === void 0) {
      const nodeName = parsedPath.nodeName;
      console.error(
        `PropertyBinding: Trying to update property for track: ${nodeName}.${propertyName} but it wasn't found.`,
        targetObject
      );
      return;
    }
    let versioning = this.#Versioning.None;
    this.targetObject = targetObject;
    if (targetObject.needsUpdate !== void 0) {
      versioning = this.#Versioning.NeedsUpdate;
    } else if (targetObject.matrixWorldNeedsUpdate !== void 0) {
      versioning = this.#Versioning.MatrixWorldNeedsUpdate;
    }
    let bindingType = this.#BindingType.Direct;
    if (propertyIndex !== void 0) {
      if (propertyName === "morphTargetInfluences") {
        if (!targetObject.geometry) {
          console.error(
            "PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",
            this
          );
          return;
        }
        if (!targetObject.geometry.morphAttributes) {
          console.error(
            "PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",
            this
          );
          return;
        }
        if (targetObject.morphTargetDictionary[propertyIndex] !== void 0) {
          propertyIndex = targetObject.morphTargetDictionary[propertyIndex];
        }
      }
      bindingType = this.#BindingType.ArrayElement;
      this.resolvedProperty = nodeProperty;
      this.propertyIndex = propertyIndex;
    } else if (nodeProperty.fromArray !== void 0 && nodeProperty.toArray !== void 0) {
      bindingType = this.#BindingType.HasFromToArray;
      this.resolvedProperty = nodeProperty;
    } else if (Array.isArray(nodeProperty)) {
      bindingType = this.#BindingType.EntireArray;
      this.resolvedProperty = nodeProperty;
    } else {
      this.propertyName = propertyName;
    }
    this.getValue = this.#GetterByBindingType[bindingType];
    this.setValue = this.#SetterByBindingTypeAndVersioning[bindingType][versioning];
  }
  unbind() {
    this.node = null;
    this.getValue = this.#getValue_unbound;
    this.setValue = this.#setValue_unbound;
  }
}
const _RESERVED_CHARS_RE = "\\[\\]\\.:\\/";
const _reservedRe = new RegExp(`[${_RESERVED_CHARS_RE}]`, "g");
const _wordChar = `[^${_RESERVED_CHARS_RE}]`;
const _wordCharOrDot = `[^${_RESERVED_CHARS_RE.replace("\\.", "")}]`;
const _directoryRe = /* @__PURE__ */ /((?:WC+[/:])*)/.source.replace("WC", _wordChar);
const _nodeRe = /* @__PURE__ */ /(WCOD+)?/.source.replace("WCOD", _wordCharOrDot);
const _objectRe = /* @__PURE__ */ /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", _wordChar);
const _propertyRe = /* @__PURE__ */ /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", _wordChar);
const _trackRe = new RegExp(
  `^${_directoryRe}${_nodeRe}${_objectRe}${_propertyRe}$`
);
const _supportedObjectNames = ["material", "materials", "bones", "map"];

class PropertyMixer {
  binding;
  valueSize;
  buffer;
  #workIndex;
  #mixBufferRegion;
  #mixBufferRegionAdditive;
  #setIdentity;
  #origIndex = 3;
  #addIndex = 4;
  cumulativeWeight = 0;
  cumulativeWeightAdditive = 0;
  useCount = 0;
  referenceCount = 0;
  constructor(binding, typeName, valueSize) {
    this.binding = binding;
    this.valueSize = valueSize;
    let mixFunction;
    let mixFunctionAdditive;
    let setIdentity;
    switch (typeName) {
      case "quaternion":
        mixFunction = this.#slerp;
        mixFunctionAdditive = this.#slerpAdditive;
        setIdentity = this.#setAdditiveIdentityQuaternion;
        this.buffer = new Float64Array(valueSize * 6);
        this.#workIndex = 5;
        break;
      case "string":
      case "bool":
        mixFunction = this.#select;
        mixFunctionAdditive = this.#select;
        setIdentity = this.#setAdditiveIdentityOther;
        this.buffer = new Array(valueSize * 5);
        break;
      default:
        mixFunction = this.#lerp;
        mixFunctionAdditive = this.#lerpAdditive;
        setIdentity = this.#setAdditiveIdentityNumeric;
        this.buffer = new Float64Array(valueSize * 5);
    }
    this.#mixBufferRegion = mixFunction;
    this.#mixBufferRegionAdditive = mixFunctionAdditive;
    this.#setIdentity = setIdentity;
  }
  // accumulate data in the 'incoming' region into 'accu<i>'
  accumulate(accuIndex, weight) {
    const buffer = this.buffer;
    const stride = this.valueSize;
    const offset = accuIndex * stride + stride;
    let currentWeight = this.cumulativeWeight;
    if (currentWeight === 0) {
      for (let i = 0; i !== stride; ++i) {
        buffer[offset + i] = buffer[i];
      }
      currentWeight = weight;
    } else {
      currentWeight += weight;
      const mix = weight / currentWeight;
      this.#mixBufferRegion(buffer, offset, 0, mix, stride);
    }
    this.cumulativeWeight = currentWeight;
  }
  // accumulate data in the 'incoming' region into 'add'
  accumulateAdditive(weight) {
    const buffer = this.buffer;
    const stride = this.valueSize;
    const offset = stride * this.#addIndex;
    if (this.cumulativeWeightAdditive === 0) {
      this.#setIdentity();
    }
    this.#mixBufferRegionAdditive(buffer, offset, 0, weight, stride);
    this.cumulativeWeightAdditive += weight;
  }
  // apply the state of 'accu<i>' to the binding when accus differ
  apply(accuIndex) {
    const stride = this.valueSize;
    const buffer = this.buffer;
    const offset = accuIndex * stride + stride;
    const weight = this.cumulativeWeight;
    const weightAdditive = this.cumulativeWeightAdditive;
    const binding = this.binding;
    this.cumulativeWeight = 0;
    this.cumulativeWeightAdditive = 0;
    if (weight < 1) {
      const originalValueOffset = stride * this.#origIndex;
      this.#mixBufferRegion(buffer, offset, originalValueOffset, 1 - weight, stride);
    }
    if (weightAdditive > 0) {
      this.#mixBufferRegionAdditive(buffer, offset, this.#addIndex * stride, 1, stride);
    }
    for (let i = stride, e = stride + stride; i !== e; ++i) {
      if (buffer[i] !== buffer[i + stride]) {
        binding.setValue(buffer, offset);
        break;
      }
    }
  }
  // remember the state of the bound property and copy it to both accus
  saveOriginalState() {
    const binding = this.binding;
    const buffer = this.buffer;
    const stride = this.valueSize;
    const originalValueOffset = stride * this.#origIndex;
    binding.getValue(buffer, originalValueOffset);
    for (let i = stride, e = originalValueOffset; i !== e; ++i) {
      buffer[i] = buffer[originalValueOffset + i % stride];
    }
    this.#setIdentity();
    this.cumulativeWeight = 0;
    this.cumulativeWeightAdditive = 0;
  }
  // apply the state previously taken via 'saveOriginalState' to the binding
  restoreOriginalState() {
    const originalValueOffset = this.valueSize * 3;
    this.binding.setValue(this.buffer, originalValueOffset);
  }
  #setAdditiveIdentityNumeric() {
    const startIndex = this.#addIndex * this.valueSize;
    const endIndex = startIndex + this.valueSize;
    for (let i = startIndex; i < endIndex; i++) {
      this.buffer[i] = 0;
    }
  }
  #setAdditiveIdentityQuaternion() {
    this.#setAdditiveIdentityNumeric();
    this.buffer[this.#addIndex * this.valueSize + 3] = 1;
  }
  #setAdditiveIdentityOther() {
    const startIndex = this.#origIndex * this.valueSize;
    const targetIndex = this.#addIndex * this.valueSize;
    for (let i = 0; i < this.valueSize; i++) {
      this.buffer[targetIndex + i] = this.buffer[startIndex + i];
    }
  }
  // mix functions
  #select(buffer, dstOffset, srcOffset, t, stride) {
    if (t >= 0.5) {
      for (let i = 0; i !== stride; ++i) {
        buffer[dstOffset + i] = buffer[srcOffset + i];
      }
    }
  }
  #slerp(buffer, dstOffset, srcOffset, t) {
    Quaternion.slerpFlat(buffer, dstOffset, buffer, dstOffset, buffer, srcOffset, t);
  }
  #slerpAdditive(buffer, dstOffset, srcOffset, t, stride) {
    const workOffset = this.#workIndex * stride;
    Quaternion.multiplyQuaternionsFlat(buffer, workOffset, buffer, dstOffset, buffer, srcOffset);
    Quaternion.slerpFlat(buffer, dstOffset, buffer, dstOffset, buffer, workOffset, t);
  }
  #lerp(buffer, dstOffset, srcOffset, t, stride) {
    const s = 1 - t;
    for (let i = 0; i !== stride; ++i) {
      const j = dstOffset + i;
      buffer[j] = buffer[j] * s + buffer[srcOffset + i] * t;
    }
  }
  #lerpAdditive(buffer, dstOffset, srcOffset, t, stride) {
    for (let i = 0; i !== stride; ++i) {
      const j = dstOffset + i;
      buffer[j] = buffer[j] + buffer[srcOffset + i] * t;
    }
  }
}

const _controlInterpolantsResultBuffer = new Float32Array(1);
class AnimationMixer extends EventDispatcher {
  #root;
  /**
   * 'nActiveActions' followed by inactive ones
   * @type {AnimationAction[]}
   */
  #actions = [];
  #nActiveActions = 0;
  #actionsByClip = /* @__PURE__ */ new Map();
  // inside:
  // {
  // 	knownActions: Array< AnimationAction > - used as prototypes
  // 	actionByRoot: AnimationAction - lookup
  // }
  #bindings = [];
  // 'nActiveBindings' followed by inactive ones
  #nActiveBindings = 0;
  #bindingsByRootAndName = /* @__PURE__ */ new Map();
  // inside: Map< name, PropertyMixer >
  #controlInterpolants = [];
  // same game as above
  #nActiveControlInterpolants = 0;
  stats;
  #accuIndex = 0;
  time = 0;
  timeScale = 1;
  constructor(root) {
    super();
    this.#root = root;
    this.#initMemoryManager();
  }
  #bindAction(action, prototypeAction) {
    const root = action.localRoot || this.#root;
    const tracks = action.getClip().tracks;
    const nTracks = tracks.length;
    const bindings = action._propertyBindings;
    const interpolants = action._interpolants;
    const rootUuid = root.uuid;
    const bindingsByRoot = this.#bindingsByRootAndName;
    let bindingsByName = bindingsByRoot.get(rootUuid);
    if (bindingsByName === void 0) {
      bindingsByName = /* @__PURE__ */ new Map();
      bindingsByRoot.set(rootUuid, bindingsByName);
    }
    for (let i = 0; i !== nTracks; ++i) {
      const track = tracks[i];
      const trackName = track.name;
      let binding = bindingsByName.get(trackName);
      if (binding !== void 0) {
        ++binding.referenceCount;
        bindings[i] = binding;
      } else {
        binding = bindings[i];
        if (binding !== void 0) {
          if (binding._cacheIndex === null) {
            ++binding.referenceCount;
            this.#addInactiveBinding(binding, rootUuid, trackName);
          }
          continue;
        }
        const path = prototypeAction && prototypeAction._propertyBindings[i].binding.parsedPath;
        binding = new PropertyMixer(
          PropertyBinding.create(root, trackName, path),
          track.ValueTypeName,
          track.getValueSize()
        );
        ++binding.referenceCount;
        this.#addInactiveBinding(binding, rootUuid, trackName);
        bindings[i] = binding;
      }
      interpolants[i].resultBuffer = binding.buffer;
    }
  }
  _activateAction(action) {
    if (!this._isActiveAction(action)) {
      if (action._cacheIndex === null) {
        const rootUuid = (action.localRoot || this.#root).uuid;
        const clipUuid = action.getClip().uuid;
        const actionsForClip = this.#actionsByClip.get(clipUuid);
        this.#bindAction(action, actionsForClip && actionsForClip.knownActions[0]);
        this.#addInactiveAction(action, clipUuid, rootUuid);
      }
      const bindings = action._propertyBindings;
      for (let i = 0, n = bindings.length; i !== n; ++i) {
        const binding = bindings[i];
        if (binding.useCount++ === 0) {
          this.#lendBinding(binding);
          binding.saveOriginalState();
        }
      }
      this.#lendAction(action);
    }
  }
  _deactivateAction(action) {
    if (this._isActiveAction(action)) {
      const bindings = action._propertyBindings;
      for (let i = 0, n = bindings.length; i !== n; ++i) {
        const binding = bindings[i];
        if (--binding.useCount === 0) {
          binding.restoreOriginalState();
          this.#takeBackBinding(binding);
        }
      }
      this.#takeBackAction(action);
    }
  }
  // Memory manager
  #initMemoryManager() {
    this.#actions = [];
    this.#nActiveActions = 0;
    this.#actionsByClip = /* @__PURE__ */ new Map();
    this.#bindings = [];
    this.#nActiveBindings = 0;
    this.#bindingsByRootAndName = /* @__PURE__ */ new Map();
    this.#controlInterpolants = [];
    this.#nActiveControlInterpolants = 0;
    const scope = this;
    this.stats = {
      actions: {
        get total() {
          return scope.#actions.length;
        },
        get inUse() {
          return scope.#nActiveActions;
        }
      },
      bindings: {
        get total() {
          return scope.#bindings.length;
        },
        get inUse() {
          return scope.#nActiveBindings;
        }
      },
      controlInterpolants: {
        get total() {
          return scope.#controlInterpolants.length;
        },
        get inUse() {
          return scope.#nActiveControlInterpolants;
        }
      }
    };
  }
  // Memory management for AnimationAction objects
  _isActiveAction(action) {
    const index = action._cacheIndex;
    return index !== null && index < this.#nActiveActions;
  }
  #addInactiveAction(action, clipUuid, rootUuid) {
    const actions = this.#actions;
    const actionsByClip = this.#actionsByClip;
    let actionsForClip = actionsByClip.get(clipUuid);
    if (actionsForClip === void 0) {
      actionsForClip = {
        knownActions: [action],
        actionByRoot: /* @__PURE__ */ new Map()
      };
      action._byClipCacheIndex = 0;
      actionsByClip.set(clipUuid, actionsForClip);
    } else {
      const knownActions = actionsForClip.knownActions;
      action._byClipCacheIndex = knownActions.length;
      knownActions.push(action);
    }
    action._cacheIndex = actions.length;
    actions.push(action);
    actionsForClip.actionByRoot.set(rootUuid, action);
  }
  #removeInactiveAction(action) {
    const actions = this.#actions;
    const lastInactiveAction = actions[actions.length - 1];
    const cacheIndex = action._cacheIndex;
    lastInactiveAction._cacheIndex = cacheIndex;
    actions[cacheIndex] = lastInactiveAction;
    actions.pop();
    action._cacheIndex = null;
    const clipUuid = action.getClip().uuid;
    const actionsByClip = this.#actionsByClip;
    const actionsForClip = actionsByClip.get(clipUuid);
    const knownActionsForClip = actionsForClip.knownActions;
    const lastKnownAction = knownActionsForClip[knownActionsForClip.length - 1];
    const byClipCacheIndex = action._byClipCacheIndex;
    lastKnownAction._byClipCacheIndex = byClipCacheIndex;
    knownActionsForClip[byClipCacheIndex] = lastKnownAction;
    knownActionsForClip.pop();
    action._byClipCacheIndex = null;
    const actionByRoot = actionsForClip.actionByRoot;
    const rootUuid = (action.localRoot || this.#root).uuid;
    actionByRoot.delete(rootUuid);
    if (knownActionsForClip.length === 0) {
      actionsByClip.delete(clipUuid);
    }
    this.#removeInactiveBindingsForAction(action);
  }
  #removeInactiveBindingsForAction(action) {
    const bindings = action._propertyBindings;
    for (let i = 0, n = bindings.length; i !== n; ++i) {
      const binding = bindings[i];
      if (--binding.referenceCount === 0) {
        this.#removeInactiveBinding(binding);
      }
    }
  }
  #lendAction(action) {
    const actions = this.#actions;
    const prevIndex = action._cacheIndex;
    const lastActiveIndex = this.#nActiveActions++;
    const firstInactiveAction = actions[lastActiveIndex];
    action._cacheIndex = lastActiveIndex;
    actions[lastActiveIndex] = action;
    firstInactiveAction._cacheIndex = prevIndex;
    actions[prevIndex] = firstInactiveAction;
  }
  #takeBackAction(action) {
    const actions = this.#actions;
    const prevIndex = action._cacheIndex;
    const firstInactiveIndex = --this.#nActiveActions;
    const lastActiveAction = actions[firstInactiveIndex];
    action._cacheIndex = firstInactiveIndex;
    actions[firstInactiveIndex] = action;
    lastActiveAction._cacheIndex = prevIndex;
    actions[prevIndex] = lastActiveAction;
  }
  // Memory management for PropertyMixer objects
  #addInactiveBinding(binding, rootUuid, trackName) {
    const bindingsByRoot = this.#bindingsByRootAndName;
    const bindings = this.#bindings;
    let bindingByName = bindingsByRoot.get(rootUuid);
    if (bindingByName === void 0) {
      bindingByName = /* @__PURE__ */ new Map();
      bindingsByRoot.set(rootUuid, bindingByName);
    }
    bindingByName.set(trackName, binding);
    binding._cacheIndex = bindings.length;
    bindings.push(binding);
  }
  #removeInactiveBinding(binding) {
    const bindings = this.#bindings;
    const propBinding = binding.binding;
    const rootUuid = propBinding.rootNode.uuid;
    const trackName = propBinding.path;
    const bindingsByRoot = this.#bindingsByRootAndName;
    const bindingByName = bindingsByRoot.get(rootUuid);
    const lastInactiveBinding = bindings[bindings.length - 1];
    const cacheIndex = binding._cacheIndex;
    lastInactiveBinding._cacheIndex = cacheIndex;
    bindings[cacheIndex] = lastInactiveBinding;
    bindings.pop();
    bindingByName.delete(trackName);
    if (bindingByName.size === 0) {
      bindingsByRoot.delete(rootUuid);
    }
  }
  #lendBinding(binding) {
    const bindings = this.#bindings;
    const prevIndex = binding._cacheIndex;
    const lastActiveIndex = this.#nActiveBindings++;
    const firstInactiveBinding = bindings[lastActiveIndex];
    binding._cacheIndex = lastActiveIndex;
    bindings[lastActiveIndex] = binding;
    firstInactiveBinding._cacheIndex = prevIndex;
    bindings[prevIndex] = firstInactiveBinding;
  }
  #takeBackBinding(binding) {
    const bindings = this.#bindings;
    const prevIndex = binding._cacheIndex;
    const firstInactiveIndex = --this.#nActiveBindings;
    const lastActiveBinding = bindings[firstInactiveIndex];
    binding._cacheIndex = firstInactiveIndex;
    bindings[firstInactiveIndex] = binding;
    lastActiveBinding._cacheIndex = prevIndex;
    bindings[prevIndex] = lastActiveBinding;
  }
  // Memory management of Interpolants for weight and time scale
  _lendControlInterpolant() {
    const interpolants = this.#controlInterpolants;
    const lastActiveIndex = this.#nActiveControlInterpolants++;
    let interpolant = interpolants[lastActiveIndex];
    if (interpolant === void 0) {
      interpolant = new LinearInterpolant(
        new Float32Array(2),
        new Float32Array(2),
        1,
        _controlInterpolantsResultBuffer
      );
      interpolant.__cacheIndex = lastActiveIndex;
      interpolants[lastActiveIndex] = interpolant;
    }
    return interpolant;
  }
  _takeBackControlInterpolant(interpolant) {
    const interpolants = this.#controlInterpolants;
    const prevIndex = interpolant.__cacheIndex;
    const firstInactiveIndex = --this.#nActiveControlInterpolants;
    const lastActiveInterpolant = interpolants[firstInactiveIndex];
    interpolant.__cacheIndex = firstInactiveIndex;
    interpolants[firstInactiveIndex] = interpolant;
    lastActiveInterpolant.__cacheIndex = prevIndex;
    interpolants[prevIndex] = lastActiveInterpolant;
  }
  // return an action for a clip optionally using a custom root target
  // object (this method allocates a lot of dynamic memory in case a
  // previously unknown clip/root combination is specified)
  /** @returns {?AnimationAction} */
  clipAction(clip, optionalRoot, blendMode) {
    const root = optionalRoot || this.#root;
    const rootUuid = root.uuid;
    let clipObject = typeof clip === "string" ? AnimationClip.findByName(root, clip) : clip;
    const clipUuid = clipObject !== null ? clipObject.uuid : clip;
    const actionsForClip = this.#actionsByClip.get(clipUuid);
    let prototypeAction = null;
    if (blendMode === void 0) {
      if (clipObject !== null) {
        blendMode = clipObject.blendMode;
      } else {
        blendMode = NormalAnimationBlendMode;
      }
    }
    if (actionsForClip !== void 0) {
      const existingAction = actionsForClip.actionByRoot.get(rootUuid);
      if (existingAction !== void 0 && existingAction.blendMode === blendMode) {
        return existingAction;
      }
      prototypeAction = actionsForClip.knownActions[0];
      if (clipObject === null) clipObject = prototypeAction.getClip();
    }
    if (clipObject === null) return null;
    const newAction = new AnimationAction(this, clipObject, optionalRoot, blendMode);
    this.#bindAction(newAction, prototypeAction);
    this.#addInactiveAction(newAction, clipUuid, rootUuid);
    return newAction;
  }
  // get an existing action
  existingAction(clip, optionalRoot) {
    const root = optionalRoot || this.#root;
    const rootUuid = root.uuid;
    const clipObject = typeof clip === "string" ? AnimationClip.findByName(root, clip) : clip;
    const clipUuid = clipObject ? clipObject.uuid : clip;
    const actionsForClip = this.#actionsByClip.get(clipUuid);
    if (actionsForClip !== void 0) {
      return actionsForClip.actionByRoot.get(rootUuid) || null;
    }
    return null;
  }
  // deactivates all previously scheduled actions
  stopAllAction() {
    const actions = this.#actions;
    const nActions = this.#nActiveActions;
    for (let i = nActions - 1; i >= 0; --i) {
      actions[i].stop();
    }
    return this;
  }
  // advance the time and update apply the animation
  update(deltaTime) {
    deltaTime *= this.timeScale;
    const actions = this.#actions;
    const nActions = this.#nActiveActions;
    const time = this.time += deltaTime;
    const timeDirection = Math.sign(deltaTime);
    const accuIndex = this.#accuIndex ^= 1;
    for (let i = 0; i !== nActions; ++i) {
      const action = actions[i];
      action._update(time, deltaTime, timeDirection, accuIndex);
    }
    const bindings = this.#bindings;
    const nBindings = this.#nActiveBindings;
    for (let i = 0; i !== nBindings; ++i) {
      bindings[i].apply(accuIndex);
    }
    return this;
  }
  // Allows you to seek to a specific time in an animation.
  setTime(timeInSeconds) {
    this.time = 0;
    for (let i = 0; i < this.#actions.length; i++) {
      this.#actions[i].time = 0;
    }
    return this.update(timeInSeconds);
  }
  // return this mixer's root target object
  getRoot() {
    return this.#root;
  }
  // free all resources specific to a particular clip
  uncacheClip(clip) {
    const actions = this.#actions;
    const clipUuid = clip.uuid;
    const actionsByClip = this.#actionsByClip;
    const actionsForClip = actionsByClip.get(clipUuid);
    if (actionsForClip !== void 0) {
      const actionsToRemove = actionsForClip.knownActions;
      for (let i = 0, n = actionsToRemove.length; i !== n; ++i) {
        const action = actionsToRemove[i];
        this._deactivateAction(action);
        const cacheIndex = action._cacheIndex;
        const lastInactiveAction = actions[actions.length - 1];
        action._cacheIndex = null;
        action._byClipCacheIndex = null;
        lastInactiveAction._cacheIndex = cacheIndex;
        actions[cacheIndex] = lastInactiveAction;
        actions.pop();
        this.#removeInactiveBindingsForAction(action);
      }
      actionsByClip.delete(clipUuid);
    }
  }
  // free all resources specific to a particular root target object
  uncacheRoot(root) {
    const rootUuid = root.uuid;
    const actionsByClip = this.#actionsByClip;
    for (const clipUuid of actionsByClip.keys()) {
      const actionByRoot = actionsByClip.get(clipUuid).actionByRoot;
      const action = actionByRoot.get(rootUuid);
      if (action !== void 0) {
        this._deactivateAction(action);
        this.#removeInactiveAction(action);
      }
    }
    const bindingsByRoot = this.#bindingsByRootAndName;
    const bindingByName = bindingsByRoot.get(rootUuid);
    if (bindingByName !== void 0) {
      for (const binding of bindingByName.values()) {
        binding.restoreOriginalState();
        this.#removeInactiveBinding(binding);
      }
    }
  }
  // remove a targeted clip from the cache
  uncacheAction(clip, optionalRoot) {
    const action = this.existingAction(clip, optionalRoot);
    if (action !== null) {
      this._deactivateAction(action);
      this.#removeInactiveAction(action);
    }
  }
}

export { AnimationAction, AnimationClip, AnimationMixer, PropertyBinding, PropertyMixer, flattenJSON, getKeyframeOrder, makeClipAdditive, sortedArray, subclip };
