import { Request, Response } from 'enonic-types/controller'
import { parseRelatedFactPageData, RelatedFactPages, RelatedFactPageConfig } from '../../site/parts/relatedFactPage/relatedFactPage'

exports.get = (req: Request): Response => {
  const start: number = Number(req.params.start) ? Number(req.params.start) : 0
  const count: number = Number(req.params.count) ? Number(req.params.count) : 10
  const partConfig: RelatedFactPageConfig = req.params.partConfig ? JSON.parse(req.params.partConfig) as RelatedFactPageConfig : {}

  const result: RelatedFactPages = parseRelatedFactPageData(partConfig, start, count)

  return {
    status: 200,
    contentType: 'application/json',
    body: result
  }
}
