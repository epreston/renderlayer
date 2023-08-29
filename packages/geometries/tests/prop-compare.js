// Compare two geometries.
export function getDifferingProp(geometryA, geometryB) {
  const geometryKeys = Object.keys(geometryA);
  const cloneKeys = Object.keys(geometryB);

  let differingProp = undefined;

  for (let i = 0, l = geometryKeys.length; i < l; i++) {
    const key = geometryKeys[i];

    if (cloneKeys.indexOf(key) < 0) {
      differingProp = key;
      break;
    }
  }

  return differingProp;
}
