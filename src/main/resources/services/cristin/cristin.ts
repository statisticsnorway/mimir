import { Result, Project, FetchResponse, ListOfResults } from '/lib/cristin/service'
import { fetchProjectCristin, fetchResultCristin, fetchResultsCristin } from '../../lib/ssb/cristin/cristin'

exports.get = (req: XP.Request): XP.Response => {
  // eslint-disable-next-line camelcase
  const per_page: string = '10'
  const contributor: string | undefined = req.params.contributor
  const category: string | undefined = req.params.category
  const page: string | undefined = req.params.page

  const results: FetchResponse<ListOfResults> = fetchResultsCristin(contributor, category, per_page, page)

  return {
    body: JSON.stringify({
      results
    }, null, 2),
    contentType: 'application/json'
  }
}
