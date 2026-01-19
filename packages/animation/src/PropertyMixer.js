import { Quaternion } from '@renderlayer/math';

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

    // buffer layout: [ incoming | accu0 | accu1 | orig | addAccu | (optional work) ]
    //
    // Interpolators can use .buffer as their .result
    // the data then goes to 'incoming'
    //
    // 'accu0' and 'accu1' are used frame-interleaved for
    // the cumulative result and are compared to detect
    // changes
    //
    // 'orig' stores the original state of the property
    //
    // 'add' is used for additive cumulative results
    //
    // 'work' is optional and is only present for quaternion types. It is used
    // to store intermediate quaternion multiplication results

    switch (typeName) {
      case 'quaternion':
        mixFunction = this.#slerp;
        mixFunctionAdditive = this.#slerpAdditive;
        setIdentity = this.#setAdditiveIdentityQuaternion;

        this.buffer = new Float64Array(valueSize * 6);
        this.#workIndex = 5;
        break;

      case 'string':
      case 'bool':
        mixFunction = this.#select;

        // Use the regular mix function and for additive on these types,
        // additive is not relevant for non-numeric types
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
    // note: happily accumulating nothing when weight = 0, the caller knows
    // the weight and shouldn't have made the call in the first place

    const buffer = this.buffer;

    const stride = this.valueSize;
    const offset = accuIndex * stride + stride;

    let currentWeight = this.cumulativeWeight;

    if (currentWeight === 0) {
      // accuN := incoming * weight
      for (let i = 0; i !== stride; ++i) {
        buffer[offset + i] = buffer[i];
      }

      currentWeight = weight;
    } else {
      // accuN := accuN + incoming * weight
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
      // add = identity
      this.#setIdentity();
    }

    // add := add + incoming * weight
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
      // accuN := accuN + original * ( 1 - cumulativeWeight )
      const originalValueOffset = stride * this.#origIndex;

      this.#mixBufferRegion(buffer, offset, originalValueOffset, 1 - weight, stride);
    }

    if (weightAdditive > 0) {
      // accuN := accuN + additive accuN
      this.#mixBufferRegionAdditive(buffer, offset, this.#addIndex * stride, 1, stride);
    }

    for (let i = stride, e = stride + stride; i !== e; ++i) {
      if (buffer[i] !== buffer[i + stride]) {
        // value has changed -> update scene graph

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

    // accu[0..1] := orig -- initially detect changes against the original
    for (let i = stride, e = originalValueOffset; i !== e; ++i) {
      buffer[i] = buffer[originalValueOffset + (i % stride)];
    }

    // Add to identity for additive
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

    // Store result in intermediate buffer offset
    Quaternion.multiplyQuaternionsFlat(buffer, workOffset, buffer, dstOffset, buffer, srcOffset);

    // Slerp to the intermediate result
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

export { PropertyMixer };
