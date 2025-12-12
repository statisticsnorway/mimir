import { type Request, type Response } from '@enonic-types/core'
import { getNameSearchResult } from '/lib/ssb/utils/nameSearchUtils'
import { type SolrResponse } from '/lib/types/solr'

export function get(req: Request): Response {
  if (!req.params.name) {
    return {
      body: {
        message: 'name parameter missing',
      },
      contentType: 'application/json',
    }
  }
  const name = (req.params.name as string).trim()
  const includeGraphData = req.params.includeGraphData === 'true'
  const nameResult: SolrResponse = getNameSearchResult(name, includeGraphData)

  return {
    body: nameResult.body,
    status: nameResult.status,
    contentType: 'application/json',
  }
}
