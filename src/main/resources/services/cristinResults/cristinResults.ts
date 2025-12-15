import { type Request, type Response } from '@enonic-types/core'
import { fetchResultsCristin } from '/lib/ssb/cristin/cristin'

export const get = (req: Request): Response => {
  const per_page = req.params.per_page ? req.params.per_page.toString() : '10'
  const contributor = req.params?.contributor?.toString()
  const category = req.params?.category?.toString()
  const page = req.params?.page?.toString()
  const sort = req.params?.sort?.toString()

  const results = fetchResultsCristin(contributor, category, per_page, page, sort)

  return {
    body: results,
    contentType: 'application/json',
  }
}
