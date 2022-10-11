import { parseRelatedFactPageData, RelatedFactPages, RelatedFactPageConfig } from '../../site/parts/relatedFactPage/relatedFactPage'

exports.get = (req: XP.Request): XP.Response => {
  const start: number = Number(req.params.start) ? Number(req.params.start) : 0
  const count: number = Number(req.params.count) ? Number(req.params.count) : 10
  const partConfig: RelatedFactPageConfig | undefined = req.params.partConfig ? JSON.parse(req.params.partConfig) as RelatedFactPageConfig : undefined

  const result: RelatedFactPages = parseRelatedFactPageData(partConfig, start, count)

  return {
    status: 200,
    contentType: 'application/json',
    body: result
  }
}
