import { Request, Response } from 'enonic-types/controller'
import { SolrPrepResultAndTotal } from '../../lib/ssb/utils/solrUtils'

const {
  solrSearch
} = __non_webpack_require__('/lib/ssb/utils/solrUtils')

const {
  sanitizeForSolr
} = __non_webpack_require__('/lib/ssb/utils/textUtils')

export function get(req: Request): Response {
  const searchTerm: string | undefined = req.params.sok ? sanitizeForSolr(req.params.sok) : undefined
  const language: string = req.params.language ? req.params.language : 'nb'
  const count: number = req.params.count ? parseInt(req.params.count) : 15
  const start: number = req.params.start ? parseInt(req.params.start) : 0
  const mainSubject: string = req.params.mainsubject ? req.params.mainsubject : ''

  const result: SolrPrepResultAndTotal = searchTerm ?
    solrSearch(searchTerm, language, count, start, mainSubject) : {
      total: 0,
      hits: []
    }
  return {
    body: result,
    contentType: 'application/json'
  }
}
