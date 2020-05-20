const { data: { forceArray }} = __non_webpack_require__( '/lib/util')

export function ensureArray<T> (candidate: Array<T>): Array<T> {
  return candidate ? forceArray(candidate) : []
}
