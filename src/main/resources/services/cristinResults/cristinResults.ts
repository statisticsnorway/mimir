import { FetchResponse, ListOfResults } from '/lib/cristin/service'
import { fetchResultsCristin } from '../../lib/ssb/cristin/cristin'

exports.get = (req: XP.Request): XP.Response => {
  // eslint-disable-next-line camelcase
  const per_page: string = '10'
  const contributor: string | undefined = req.params.contributor
  const category: string | undefined = req.params.category
  const page: string | undefined = req.params.page
  const sort: string | undefined = req.params.sort

  const results: FetchResponse<ListOfResults> = fetchResultsCristin(contributor, category, per_page, page, sort)

  return {
    body: results,
    contentType: 'application/json'
  }
}
