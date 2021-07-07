import { StatisticInListing } from '../dashboard/statreg/types'
const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')

export function ensureArray<T>(candidate: Array<T> | null | undefined | T ): Array<T> {
  return candidate ? forceArray(candidate) : []
}

export function chunkArray<T>(myArray: Array<T>, chunkSize: number): Array<Array<T>> {
  const results: Array<Array<T>> = []
  while (myArray.length) {
    results.push(myArray.splice(0, chunkSize))
  }
  return results
}

export function checkLimitAndTrim(releases: Array<StatisticInListing>, releasesOnThisDay: Array<StatisticInListing>, count: number): Array<StatisticInListing> {
  if (releases.length + releasesOnThisDay.length > count) {
    const whereToSlice: number = (count - releases.length)
    return releasesOnThisDay.slice(0, whereToSlice)
  }
  return releasesOnThisDay
}


export interface ArrayUtilsLib {
  ensureArray: <T>(candidate: Array<T> | T | null | undefined) => Array<T>;
  chunkArray: <T>(myArray: Array<T>, chunkSize: number) => Array<Array<T>>;
  checkLimitAndTrim: <T>(releases: Array<T>, releasesOnThisDay: Array<T>, count: number) => Array<T>;
}


