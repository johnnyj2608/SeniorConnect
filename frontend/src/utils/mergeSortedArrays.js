function mergeSortedArrays(arrays, keyFn) {
  const result = [];
  const pointers = new Array(arrays.length).fill(0);

  while (true) {
    let minIndex = -1;
    let minValue = Infinity;

    for (let i = 0; i < arrays.length; i++) {
      const arr = arrays[i];
      const pointer = pointers[i];
      if (pointer < arr.length) {
        const val = keyFn(arr[pointer]);
        if (val < minValue) {
          minValue = val;
          minIndex = i;
        }
      }
    }

    if (minIndex === -1) break;

    result.push(arrays[minIndex][pointers[minIndex]]);
    pointers[minIndex]++;
  }

  return result;
}

export default mergeSortedArrays;