import type { StatisticInListing } from '/lib/ssb/dashboard/statreg/types'

export function forceArray<A>(data: A | Array<A> | undefined): Array<A>
export function forceArray<A>(data: A | ReadonlyArray<A> | undefined): ReadonlyArray<A>
export function forceArray<A>(data: A | Array<A> | undefined): ReadonlyArray<A> {
  data = data || []
  return Array.isArray(data) ? data : [data]
}

export function ensureArray<T>(candidate: Array<T> | null | undefined | T): Array<T> {
  return candidate ? forceArray(candidate) : []
}

export function chunkArray<T>(myArray: Array<T>, chunkSize: number): Array<Array<T>> {
  const results: Array<Array<T>> = []
  while (myArray.length) {
    results.push(myArray.splice(0, chunkSize))
  }
  return results
}

export function contentArrayToRecord<Hit extends { _id: string }>(
  arr: ReadonlyArray<Hit>,
  getKey: (hit: Hit) => string = (hit) => hit._id
): Record<string, Hit> {
  return arr.reduce<Record<string, Hit>>((record, hit) => {
    record[getKey(hit)] = hit
    return record
  }, {})
}

export function flatMap<T, U>(arr: T[], f: (t: T, i?: number, all?: T[]) => U[]): U[] {
  return arr.reduce<U[]>((res, value, i, all) => res.concat(f(value, i, all)), [])
}

export function checkLimitAndTrim(
  releases: Array<StatisticInListing>,
  releasesOnThisDay: Array<StatisticInListing>,
  count: number
): Array<StatisticInListing> {
  if (releases.length + releasesOnThisDay.length > count) {
    const whereToSlice: number = count - releases.length
    return releasesOnThisDay.slice(0, whereToSlice)
  }
  return releasesOnThisDay
}

export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.length !== b.length) return false

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export interface ArrayUtilsLib {
  ensureArray: <T>(candidate: Array<T> | T | null | undefined) => Array<T>
  chunkArray: <T>(myArray: Array<T>, chunkSize: number) => Array<Array<T>>
  checkLimitAndTrim: <T>(releases: Array<T>, releasesOnThisDay: Array<T>, count: number) => Array<T>
  arraysEqual: <T>(a: T[], b: T[]) => boolean
}
