const {
  data: {
    forceArray
  }
} = __non_webpack_require__( '/lib/util')

export function ensureArray<T>(candidate: Array<T> | null): Array<T> {
  return candidate ? forceArray(candidate) : []
}

export function chunkArray<T>(myArray: Array<T>, chunkSize: number): Array<Array<T>> {
  const results: Array<Array<T>> = []
  while (myArray.length) {
    results.push(myArray.splice(0, chunkSize))
  }
  return results
}

export interface ArrayUtilsLib {
  ensureArray: <T>(candidate: Array<T> | null) => Array<T>;
  chunkArray: <T>(myArray: Array<T>, chunkSize: number) => Array<Array<T>>;
}
