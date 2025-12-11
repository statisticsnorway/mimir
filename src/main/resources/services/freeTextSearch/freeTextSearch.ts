import { type Request, type Response } from '@enonic-types/core'
import { type SolrPrepResultAndTotal } from '/lib/types/solr'
import { solrSearch } from '/lib/ssb/utils/solrUtils'

import { sanitizeForSolr } from '/lib/ssb/utils/textUtils'

export function get(req: Request): Response {
  const searchTerm = req.params.sok ? sanitizeForSolr(req.params.sok as string) : undefined
  const language = req.params.language ? (req.params.language as string) : 'nb'
  const count = req.params.count ? parseInt(req.params.count as string) : 15
  const start = req.params.start ? parseInt(req.params.start as string) : 0
  const mainSubject =
    req.params.mainsubject && req.params.mainsubject !== 'Alle emner' ? (req.params.mainsubject as string) : ''
  const contentType =
    req.params.contentType && req.params.contentType !== 'allTypes' ? (req.params.contentType as string) : ''
  const sortParam = req.params.sort ? (req.params.sort as string) : undefined

  const result: SolrPrepResultAndTotal = searchTerm
    ? solrSearch(searchTerm, language, count, start, mainSubject, contentType, sortParam)
    : {
        total: 0,
        hits: [],
        contentTypes: [],
        subjects: [],
      }

  return {
    body: JSON.stringify(result),
    contentType: 'application/json',
  }
}
