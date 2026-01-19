import { EventDispatcher } from '@renderlayer/core';
import { LinearInterpolant } from '@renderlayer/interpolants';
import { NormalAnimationBlendMode } from '@renderlayer/shared';

import { AnimationAction } from './AnimationAction.js';
import { AnimationClip } from './AnimationClip.js';
import { PropertyBinding } from './PropertyBinding.js';
import { PropertyMixer } from './PropertyMixer.js';

const _controlInterpolantsResultBuffer = new Float32Array(1);

class AnimationMixer extends EventDispatcher {
  #root;

  #actions = []; // 'nActiveActions' followed by inactive ones
  #nActiveActions = 0;

  #actionsByClip = new Map();
  // inside:
  // {
  // 	knownActions: Array< AnimationAction > - used as prototypes
  // 	actionByRoot: AnimationAction - lookup
  // }

  #bindings = []; // 'nActiveBindings' followed by inactive ones
  #nActiveBindings = 0;

  #bindingsByRootAndName = new Map(); // inside: Map< name, PropertyMixer >

  #controlInterpolants = []; // same game as above
  #nActiveControlInterpolants = 0;

  stats;

  #accuIndex = 0;
  time = 0;
  timeScale = 1.0;

  constructor(root) {
    super();

    this.#root = root;
    this.#initMemoryManager();
  }

  #bindAction(action, prototypeAction) {
    const root = action._localRoot || this.#root;
    const tracks = action._clip.tracks;
    const nTracks = tracks.length;
    const bindings = action._propertyBindings;
    const interpolants = action._interpolants;
    const rootUuid = root.uuid;
    const bindingsByRoot = this.#bindingsByRootAndName;

    let bindingsByName = bindingsByRoot.get(rootUuid);

    if (bindingsByName === undefined) {
      bindingsByName = new Map();
      bindingsByRoot.set(rootUuid, bindingsByName);
    }

    for (let i = 0; i !== nTracks; ++i) {
      const track = tracks[i];
      const trackName = track.name;

      let binding = bindingsByName.get(trackName);

      if (binding !== undefined) {
        ++binding.referenceCount;
        bindings[i] = binding;
      } else {
        binding = bindings[i];

        if (binding !== undefined) {
          // existing binding, make sure the cache knows

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
        // this action has been forgotten by the cache, but the user
        // appears to be still using it -> rebind

        const rootUuid = (action._localRoot || this.#root).uuid;

        const clipUuid = action._clip.uuid;
        const actionsForClip = this.#actionsByClip.get(clipUuid);

        this.#bindAction(action, actionsForClip && actionsForClip.knownActions[0]);

        this.#addInactiveAction(action, clipUuid, rootUuid);
      }

      const bindings = action._propertyBindings;

      // increment reference counts / sort out state
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

      // decrement reference counts / sort out state
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
    this.#actions = []; // 'nActiveActions' followed by inactive ones
    this.#nActiveActions = 0;

    this.#actionsByClip = new Map();
    // inside:
    // {
    // 	knownActions: Array< AnimationAction > - used as prototypes
    // 	actionByRoot: AnimationAction - lookup
    // }

    this.#bindings = []; // 'nActiveBindings' followed by inactive ones
    this.#nActiveBindings = 0;

    this.#bindingsByRootAndName = new Map(); // inside: Map< name, PropertyMixer >

    this.#controlInterpolants = []; // same game as above
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

    if (actionsForClip === undefined) {
      actionsForClip = {
        knownActions: [action],
        actionByRoot: new Map()
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

    const clipUuid = action._clip.uuid;
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
    const rootUuid = (action._localRoot || this.#root).uuid;

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
    // [ active actions |  inactive actions  ]
    // [  active actions >| inactive actions ]
    //                 s        a
    //                  <-swap->
    //                 a        s

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
    // [  active actions  | inactive actions ]
    // [ active actions |< inactive actions  ]
    //        a        s
    //         <-swap->
    //        s        a

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

    if (bindingByName === undefined) {
      bindingByName = new Map();
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

    if (interpolant === undefined) {
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
  /** @returns {AnimationAction | null} */
  clipAction(clip, optionalRoot, blendMode) {
    const root = optionalRoot || this.#root;
    const rootUuid = root.uuid;

    let clipObject = typeof clip === 'string' ? AnimationClip.findByName(root, clip) : clip;

    const clipUuid = clipObject !== null ? clipObject.uuid : clip;

    const actionsForClip = this.#actionsByClip.get(clipUuid);
    let prototypeAction = null;

    if (blendMode === undefined) {
      if (clipObject !== null) {
        blendMode = clipObject.blendMode;
      } else {
        blendMode = NormalAnimationBlendMode;
      }
    }

    if (actionsForClip !== undefined) {
      const existingAction = actionsForClip.actionByRoot.get(rootUuid);

      if (existingAction !== undefined && existingAction.blendMode === blendMode) {
        return existingAction;
      }

      // we know the clip, so we don't have to parse all
      // the bindings again but can just copy
      prototypeAction = actionsForClip.knownActions[0];

      // also, take the clip from the prototype action
      if (clipObject === null) clipObject = prototypeAction._clip;
    }

    // clip must be known when specified via string
    if (clipObject === null) return null;

    // allocate all resources required to run it
    const newAction = new AnimationAction(this, clipObject, optionalRoot, blendMode);

    this.#bindAction(newAction, prototypeAction);

    // and make the action known to the memory manager
    this.#addInactiveAction(newAction, clipUuid, rootUuid);

    return newAction;
  }

  // get an existing action
  existingAction(clip, optionalRoot) {
    const root = optionalRoot || this.#root;
    const rootUuid = root.uuid;
    const clipObject = typeof clip === 'string' ? AnimationClip.findByName(root, clip) : clip;
    const clipUuid = clipObject ? clipObject.uuid : clip;
    const actionsForClip = this.#actionsByClip.get(clipUuid);

    if (actionsForClip !== undefined) {
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
    const time = (this.time += deltaTime);
    const timeDirection = Math.sign(deltaTime);
    const accuIndex = (this.#accuIndex ^= 1);

    // run active actions

    for (let i = 0; i !== nActions; ++i) {
      const action = actions[i];

      action._update(time, deltaTime, timeDirection, accuIndex);
    }

    // update scene graph

    const bindings = this.#bindings;

    const nBindings = this.#nActiveBindings;

    for (let i = 0; i !== nBindings; ++i) {
      bindings[i].apply(accuIndex);
    }

    return this;
  }

  // Allows you to seek to a specific time in an animation.
  setTime(timeInSeconds) {
    this.time = 0; // Zero out time attribute for AnimationMixer object;
    for (let i = 0; i < this.#actions.length; i++) {
      this.#actions[i].time = 0; // Zero out time attribute for all associated AnimationAction objects.
    }

    return this.update(timeInSeconds); // Update used to set exact time. Returns "this" AnimationMixer object.
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

    if (actionsForClip !== undefined) {
      // note: just calling #removeInactiveAction would mess up the
      // iteration state and also require updating the state we can
      // just throw away

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

      if (action !== undefined) {
        this._deactivateAction(action);
        this.#removeInactiveAction(action);
      }
    }

    const bindingsByRoot = this.#bindingsByRootAndName;
    const bindingByName = bindingsByRoot.get(rootUuid);

    if (bindingByName !== undefined) {
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

export { AnimationMixer };
