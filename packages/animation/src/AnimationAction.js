import {
  WrapAroundEnding,
  ZeroCurvatureEnding,
  ZeroSlopeEnding,
  LoopPingPong,
  LoopOnce,
  LoopRepeat,
  NormalAnimationBlendMode,
  AdditiveAnimationBlendMode
} from '@renderlayer/shared';

class AnimationAction {
  #mixer;
  _clip;
  _localRoot = null;
  blendMode;

  #interpolantSettings;
  _interpolants; // bound by the mixer

  _propertyBindings; // inside: PropertyMixer (managed by the mixer)

  _cacheIndex = null; // for the memory manager
  _byClipCacheIndex = null; // for the memory manager

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

  repetitions = Infinity; // no. of repetitions when looping

  paused = false; // true -> zero effective time scale
  enabled = true; // false -> zero effective weight

  clampWhenFinished = false; // keep feeding the last frame?

  zeroSlopeAtStart = true; // for smooth interpolation w/o separate
  zeroSlopeAtEnd = true; // clips for start, loop and end

  constructor(mixer, clip, localRoot = null, blendMode = clip.blendMode) {
    this.#mixer = mixer;
    this._clip = clip;
    this._localRoot = localRoot;
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
    this._interpolants = interpolants; // bound by the mixer

    // inside: PropertyMixer (managed by the mixer)
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

    this.time = 0; // restart clip
    this.#loopCount = -1; // forget previous loops
    this.#startTime = null; // forget scheduling

    return this.stopFading().stopWarping();
  }

  isRunning() {
    return (
      this.enabled &&
      !this.paused &&
      this.timeScale !== 0 &&
      this.#startTime === null &&
      this.#mixer._isActiveAction(this)
    );
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

    // note: same logic as when updated at runtime
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
      const fadeInDuration = this._clip.duration;
      const fadeOutDuration = fadeOutAction._clip.duration;
      const startEndRatio = fadeOutDuration / fadeInDuration;
      const endStartRatio = fadeInDuration / fadeOutDuration;

      fadeOutAction.warp(1.0, startEndRatio, duration);
      this.warp(endStartRatio, 1.0, duration);
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
    // EP: patch bug
    this.#effectiveTimeScale = this.paused ? 0 : this.#effectiveTimeScale;
    return this.#effectiveTimeScale;
  }

  setDuration(duration) {
    this.timeScale = this._clip.duration / duration;

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
    return this._clip;
  }

  getRoot() {
    return this._localRoot || this.#mixer.getRoot();
  }

  // Internal

  _update(time, deltaTime, timeDirection, accuIndex) {
    // called by the mixer

    if (!this.enabled) {
      // call .#updateWeight() to update .#effectiveWeight

      this.#updateWeight(time);
      return;
    }

    const startTime = this.#startTime;

    if (startTime !== null) {
      // check for scheduled start of action

      const timeRunning = (time - startTime) * timeDirection;
      if (timeRunning < 0 || timeDirection === 0) {
        deltaTime = 0;
      } else {
        this.#startTime = null; // unschedule
        deltaTime = timeDirection * timeRunning;
      }
    }

    // apply time scale and advance time
    deltaTime *= this.#updateTimeScale(time);
    const clipTime = this.#updateTime(deltaTime);

    // note: _updateTime may disable the action resulting in
    // an effective weight of 0

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
            // faded out, disable
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
            // motion has halted, pause
            this.paused = true;
          } else {
            // warp done - apply final time scale
            this.timeScale = timeScale;
          }
        }
      }
    }

    this.#effectiveTimeScale = timeScale;
    return timeScale;
  }

  #updateTime(deltaTime) {
    const duration = this._clip.duration;
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
        // just started

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
          type: 'finished',
          action: this,
          direction: deltaTime < 0 ? -1 : 1
        });
      }
    } else {
      // repetitive Repeat or PingPong

      if (loopCount === -1) {
        // just started

        if (deltaTime >= 0) {
          loopCount = 0;

          this.#setEndings(true, this.repetitions === 0, pingPong);
        } else {
          // when looping in reverse direction, the initial
          // transition through zero counts as a repetition,
          // so leave loopCount at -1

          this.#setEndings(this.repetitions === 0, true, pingPong);
        }
      }

      if (time >= duration || time < 0) {
        // wrap around

        const loopDelta = Math.floor(time / duration); // signed
        time -= duration * loopDelta;

        loopCount += Math.abs(loopDelta);

        const pending = this.repetitions - loopCount;

        if (pending <= 0) {
          // have to stop (switch state, clamp time, fire event)

          if (this.clampWhenFinished) this.paused = true;
          else this.enabled = false;

          time = deltaTime > 0 ? duration : 0;

          this.time = time;

          this.#mixer.dispatchEvent({
            type: 'finished',
            action: this,
            direction: deltaTime > 0 ? 1 : -1
          });
        } else {
          // keep running

          if (pending === 1) {
            // entering the last round

            const atStart = deltaTime < 0;
            this.#setEndings(atStart, !atStart, pingPong);
          } else {
            this.#setEndings(false, false, pingPong);
          }

          this.#loopCount = loopCount;

          this.time = time;

          this.#mixer.dispatchEvent({
            type: 'loop',
            action: this,
            loopDelta: loopDelta
          });
        }
      } else {
        this.time = time;
      }

      if (pingPong && (loopCount & 1) === 1) {
        // invert time for the "pong round"

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
      // assuming for LoopOnce atStart == atEnd == true

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

export { AnimationAction };
