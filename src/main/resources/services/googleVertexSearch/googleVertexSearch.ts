import { vertexServiceSearch } from '/lib/ssb/utils/solrUtils'
import { SolrPrepResultAndTotal } from '/lib/types/solr'

export function get(req: XP.Request): XP.Response {
  const results: SolrPrepResultAndTotal = vertexServiceSearch(
    req.params.sok || 'kpi',
    Number(req.params.start) || 0,
    req.params.language || 'nb',
    Number(req.params.count) || 15,
    req.params.emne || '',
    req.params.mainsubject || '',
    req.params.sort || 'relevance'
  )

  return {
    body: results,
    contentType: 'application/json',
    status: 200,
  }
}
