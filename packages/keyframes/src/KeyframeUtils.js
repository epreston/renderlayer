// Do not export

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

export { convertArray, isTypedArray };
