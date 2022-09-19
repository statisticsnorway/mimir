import { ListOfResults } from '/lib/cristin/service'
import { fetchPersonResultsCristin } from '../../lib/ssb/cristin/cristin'

exports.get = (req: XP.Request): XP.Response => {
  const results: ListOfResults = fetchPersonResultsCristin('30621')

  return {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json'
  }
}
