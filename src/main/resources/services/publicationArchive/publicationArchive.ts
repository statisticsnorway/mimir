import { Request, Response } from 'enonic-types/controller'
import { PublicationResult } from '../../lib/ssb/utils/articleUtils'

const {
  getPublications
} = __non_webpack_require__( '/lib/ssb/utils/articleUtils')

exports.get = (req: Request): Response => {
  const start: number = Number(req.params.start) ? Number(req.params.start) : 0
  const count: number = Number(req.params.count) ? Number(req.params.count) : 10
  const language: string = req.params?.language ? req.params.language : 'nb'

  const result: PublicationResult = getPublications(start, count, language)

  return {
    status: 200,
    contentType: 'application/json',
    body: result
  }
}
