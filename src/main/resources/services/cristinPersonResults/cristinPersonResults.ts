import { type Request, type Response } from '@enonic-types/core'
import { fetchPersonResultsCristin } from '/lib/ssb/cristin/cristin'

export const get = (req: Request): Response => {
  const personId = req.params?.personId as string

  const per_page = req.params.per_page ? (req.params.per_page as string) : '10'
  const page = req.params?.page as string | undefined
  const results = fetchPersonResultsCristin(personId, per_page, page)

  return {
    body: results,
    contentType: 'application/json',
  }
}
