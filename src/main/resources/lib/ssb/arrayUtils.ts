const { data: { forceArray }} = __non_webpack_require__( '/lib/util')

export function ensureArray<T> (candidate: Array<T>): Array<T> {
  return candidate ? forceArray(candidate) : []
}

export function chunkArray(myArray: Array<any>, chunkSize: number) {
  const results: Array<any> = []
  while (myArray.length) {
    results.push(myArray.splice(0, chunkSize))
  }
  return results
}
