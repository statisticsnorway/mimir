import { type SolrPrepResultAndTotal, googleSearch } from '/lib/ssb/utils/solrUtils'

export function get(req: XP.Request): XP.Response {
  const results: SolrPrepResultAndTotal = googleSearch(
    req.params.sok,
    req.params.start || 0,
    req.params.language || 'nb',
    req.params.count || 15,
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
