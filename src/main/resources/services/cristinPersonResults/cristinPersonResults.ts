import { ListOfResults } from '/lib/cristin/service'
import { fetchPersonResultsCristin } from '../../lib/ssb/cristin/cristin'

exports.get = (req: XP.Request): XP.Response => {
  const personId: string | undefined = req.params.personId
  // eslint-disable-next-line camelcase
  const per_page: string = req.params.per_page ? req.params.per_page : '10'
  const page: string | undefined = req.params.page
  const results: ListOfResults = fetchPersonResultsCristin(personId, per_page, page)

  return {
    body: results,
    contentType: 'application/json',
  }
}
