import { Request, Response } from 'enonic-types/controller'
import { Content } from 'enonic-types/content'
import { PreparedArticles } from '../../lib/ssb/utils/articleUtils'

const {
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const {
  getChildArticles,
  prepareArticles
} = __non_webpack_require__( '/lib/ssb/utils/articleUtils')

const totalCount: number = 0

exports.get = (req: Request): Response => {
  const currentPath: string = req.params.currentPath ? req.params.currentPath : '/'
  const start: number = Number(req.params.start) ? Number(req.params.start) : 0
  const count: number = Number(req.params.count) ? Number(req.params.count) : 10
  const sort: string = req.params.sort ? req.params.sort : 'DESC'
  const language: string = req.params?.language ? req.params.language === 'en' ? 'en-gb' : req.params.language : 'nb'
  const content: Content = getContent()
  const subTopicId: string = content._id

  const preparedArticles: Array<PreparedArticles> = prepareArticles(getChildArticles(currentPath, subTopicId, start, count, sort), language)

  return {
    status: 200,
    contentType: 'application/json',
    body: {
      articles: preparedArticles,
      totalCount: totalCount
    }
  }
}
