import { Request, Response } from 'enonic-types/controller'
import { SolrPrepResultAndTotal } from '../../lib/ssb/utils/solrUtils'

const {
  solrSearch
} = __non_webpack_require__('/lib/ssb/utils/solrUtils')

export function get(req: Request): Response {
  const result: SolrPrepResultAndTotal = req.params.sok ?
    solrSearch(req.params.sok,
      req.params.language ? req.params.language : 'nb',
      req.params.count ? parseInt(req.params.count) : 15,
      req.params.start ? parseInt(req.params.start) : 0 ) : {
      total: 0,
      hits: []
    }
  return {
    body: result,
    contentType: 'application/json'
  }
}
