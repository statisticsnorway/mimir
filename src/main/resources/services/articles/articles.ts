import { Request, Response } from 'enonic-types/controller'
import { Article } from '../../site/content-types/article/article'
import { PortalLibrary } from 'enonic-types/portal'
import { Content, ContentLibrary, QueryResponse } from 'enonic-types/content'
import { Moment } from '../../lib/vendor/moment'

const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const {
  pageUrl
}: PortalLibrary = __non_webpack_require__('/lib/xp/portal')
const {
  moment
}: Moment = __non_webpack_require__('/lib/vendor/moment')

let totalCount: number = 0

exports.get = (req: Request): Response => {
  const currentPath: string = req.params.currentPath ? req.params.currentPath : '/'
  const start: number = Number(req.params.start) ? Number(req.params.start) : 0
  const count: number = Number(req.params.count) ? Number(req.params.count) : 10
  const sort: string = req.params.sort ? req.params.sort : 'DESC'
  const language: string = req.params?.language ? req.params.language : 'nb'

  const preparedArticles: Array<PreparedArticles> = prepareArticles(getChildArticles(currentPath, start, count, sort), language)

  return {
    status: 200,
    contentType: 'application/json',
    body: {
      articles: preparedArticles,
      totalCount: totalCount
    }
  }
}


function getChildArticles(currentPath: string, start: number, count: number, sort: string): QueryResponse<Article> {
  const toDay: string = moment().toISOString()
  return query({
    start: start,
    count: count,
    query: `_path LIKE "/content${currentPath}*" AND publish.from <= instant("${toDay}")`,
    contentTypes: [`${app.name}:article`],
    sort: `publish.from ${sort}`
  })
}

function prepareArticles(articles: QueryResponse<Article>, language: string): Array<PreparedArticles> {
  totalCount = articles.total
  return articles.hits.map((article: Content<Article>) => {
    return {
      title: article.displayName,
      preface: article.data.ingress ? article.data.ingress : '',
      url: pageUrl({
        id: article._id
      }),
      publishDate: article.publish && article.publish.from ? article.publish.from : '',
      publishDateHuman: article.publish && article.publish.from ? moment(article.publish.from).locale(language).format('D. MMMM YYYY') : ''
    }
  })
}

interface PreparedArticles {
    title: string;
    preface: string;
    url: string;
    publishDate: string;
}
