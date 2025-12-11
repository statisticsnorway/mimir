import { type Request, type Response } from '@enonic-types/core'
import { type RelatedFactPageConfig, type RelatedFactPages } from '/lib/types/partTypes/relatedFactPage'
import { parseRelatedFactPageData } from '/site/parts/relatedFactPage/relatedFactPage'

export const get = (req: Request): Response => {
  const start = Number(req.params.start) || 0
  const count = Number(req.params.count) || 10

  const contentIdList = req.params.contentIdList ? JSON.parse(req.params.contentIdList as string) : []

  const partConfig: RelatedFactPageConfig = {
    inputType: req.params?.inputType as string | undefined,
    contentIdList: contentIdList,
  }

  const result: RelatedFactPages = parseRelatedFactPageData(partConfig, start, count)

  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(result),
  }
}
