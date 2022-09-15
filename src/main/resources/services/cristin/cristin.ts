import { Result } from '/lib/cristin/service'
import { fetchCristinResult } from '/lib/cristin/cristin'

exports.get = (): XP.Response => {
  const result: Result | void = fetchCristinResult('1929571')

  return {
    body: JSON.stringify(result, null, 2),
    contentType: 'application/json'
  }
}
