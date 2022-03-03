import { PublicationResult } from '../../lib/ssb/parts/publicationArchive'

const {
  getPublications
} = __non_webpack_require__( '/lib/ssb/parts/publicationArchive')

exports.get = (req: XP.Request): XP.Response => {
  const start: number = Number(req.params.start) ? Number(req.params.start) : 0
  const count: number = Number(req.params.count) ? Number(req.params.count) : 10
  const language: string = req.params?.language ? req.params.language : 'nb'
  const type: string = req.params?.type ? req.params.type : ''
  const subject: string = req.params?.subject ? req.params.subject : ''

  const result: PublicationResult = getPublications(req, start, count, language, type, subject)

  return {
    status: 200,
    contentType: 'application/json',
    body: result
  }
}
