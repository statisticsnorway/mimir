import { PublicationResult } from '../../lib/ssb/parts/publicationArchive'

const { getPublications } = __non_webpack_require__('/lib/ssb/parts/publicationArchive')
//const { getPublicationsNew } = __non_webpack_require__('/lib/ssb/parts/publicationArchiveNew')
const { isEnabled } = __non_webpack_require__('/lib/featureToggle')

exports.get = (req: XP.Request): XP.Response => {
  const start: number = Number(req.params.start) ? Number(req.params.start) : 0
  const count: number = Number(req.params.count) ? Number(req.params.count) : 10
  const language: string = req.params?.language ? req.params.language : 'nb'
  const type: string = req.params?.type ? req.params.type : ''
  const subject: string = req.params?.subject ? req.params.subject : ''
  const newPublicationArchiveEnabled: boolean = isEnabled('new-publication-archive', false, 'ssb')

  const startClock: number = new Date().getTime()

  const result: PublicationResult = getPublications(req, start, count, language, type, subject)

  //TODO ta tilbake denne når/hvis x-data på artikkel
  /* const result: PublicationResult = newPublicationArchiveEnabled
    ? getPublicationsNew(req, start, count, language, type, subject)
    : getPublications(req, start, count, language, type, subject) */

  log.info(`Publikasjonsarkiv Ny (${newPublicationArchiveEnabled}) : ${new Date().getTime() - startClock} ms`)

  return {
    status: 200,
    contentType: 'application/json',
    body: result,
  }
}
