import { getNameSearchResult } from '/lib/ssb/utils/nameSearchUtils'
import { type SolrResponse } from '/lib/types/solr'

export function get(req: XP.Request): XP.Response {
  if (!req.params.name) {
    return {
      body: {
        message: 'name parameter missing',
      },
      contentType: 'application/json',
    }
  }
  const name: string = req.params.name.trim()
  const includeGraphData: boolean = req.params.includeGraphData === 'true'
  const nameResult: SolrResponse = getNameSearchResult(name, includeGraphData)

  return {
    body: nameResult.body,
    status: nameResult.status,
    contentType: 'application/json',
  }
}
