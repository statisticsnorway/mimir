import { type Request, type Response } from '@enonic-types/core'
import { getPublications } from '/lib/ssb/parts/publicationArchive'
import { type PublicationResult } from '/lib/types/partTypes/publicationArchive'

export const get = (req: Request): Response => {
  const start = Number(req.params.start) ? Number(req.params.start) : 0
  const count = Number(req.params.count) ? Number(req.params.count) : 10
  const language = req.params?.language ? req.params.language.toString() : 'nb'
  const type = req.params?.type ? req.params.type.toString() : ''
  const subject = req.params?.subject ? req.params.subject.toString() : ''

  const result: PublicationResult = getPublications(req, start, count, language, type, subject)

  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(result),
  }
}
