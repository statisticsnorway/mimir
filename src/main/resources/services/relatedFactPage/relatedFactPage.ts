import { Request, Response } from 'enonic-types/controller'
import { parseRelatedFactPageData, RelatedFactPages } from '../../site/parts/relatedFactPage/relatedFactPage'

exports.get = (req: Request): Response => {
  const start: number = Number(req.params.start) ? Number(req.params.start) : 0
  const count: number = Number(req.params.count) ? Number(req.params.count) : 10
  const language: string = req.params?.language ? req.params.language : 'nb'
  const partConfig: Array<string> = req.params.partConfig ? req.params.partConfig as unknown as Array<string> : []

  const result: RelatedFactPages = parseRelatedFactPageData(partConfig, start, count, language)

  return {
    status: 200,
    contentType: 'application/json',
    body: result
  }
}
