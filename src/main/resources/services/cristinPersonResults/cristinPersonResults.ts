import { ListOfResults } from '/lib/cristin/service'
import { fetchPersonResultsCristin } from '../../lib/ssb/cristin/cristin'

exports.get = (req: XP.Request): XP.Response => {
  const personId: string | undefined = req.params.personId
  const results: ListOfResults = fetchPersonResultsCristin(personId)

  return {
    body: results,
    contentType: 'application/json'
  }
}
