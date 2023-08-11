// Do not export

// same as Array.prototype.slice, but also works on typed arrays
function arraySlice(array, from, to) {
  if (isTypedArray(array)) {
    // in ios9 array.subarray(from, undefined) will return empty array
    // but array.subarray(from) or array.subarray(from, len) is correct
    return new array.constructor(array.subarray(from, to !== undefined ? to : array.length));
  }

  return array.slice(from, to);
}

// converts an array to a specific type
function convertArray(array, type, forceClone) {
  if (
    !array || // let 'undefined' and 'null' pass
    (!forceClone && array.constructor === type)
  )
    return array;

  if (typeof type.BYTES_PER_ELEMENT === 'number') {
    return new type(array); // create typed array
  }

  return Array.prototype.slice.call(array); // create Array
}

function isTypedArray(object) {
  return ArrayBuffer.isView(object) && !(object instanceof DataView);
}

export { arraySlice, convertArray, isTypedArray };
