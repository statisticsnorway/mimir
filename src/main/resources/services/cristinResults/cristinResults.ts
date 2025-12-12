import { type Request, type Response } from '@enonic-types/core'
import { fetchResultsCristin } from '/lib/ssb/cristin/cristin'

export const get = (req: Request): Response => {
  const per_page = req.params.per_page ? (req.params.per_page as string) : '10'
  const contributor = req.params?.contributor as string | undefined
  const category = req.params?.category as string | undefined
  const page = req.params?.page as string | undefined
  const sort = req.params?.sort as string | undefined

  const results = fetchResultsCristin(contributor, category, per_page, page, sort)

  return {
    body: results,
    contentType: 'application/json',
  }
}
