import { Result, fetchResult } from '/lib/cristin/service'

export function fetchCristinResult(id: string): Result | void {
  const result: Result | void = fetchResult({
    id
  })

  return result
}
