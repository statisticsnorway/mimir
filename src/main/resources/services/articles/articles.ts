import { Request, Response } from 'enonic-types/controller'
import { Article } from '../../site/content-types/article/article'
import { PortalLibrary } from 'enonic-types/portal'
import { Content, ContentLibrary, QueryResponse } from 'enonic-types/content'

const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const {
  pageUrl
}: PortalLibrary = __non_webpack_require__('/lib/xp/portal')

// eslint-disable-next-line @typescript-eslint/typedef
const moment = require('moment/min/moment-with-locales')
moment.locale('nb')

let totalCount: number = 0

exports.get = (req: Request): Response => {
  const currentPath: string = req.params.currentPath ? req.params.currentPath : '/'
  const start: number = Number(req.params.start) ? Number(req.params.start) : 0
  const count: number = Number(req.params.count) ? Number(req.params.count) : 10
  const sort: string = req.params.sort ? req.params.sort : 'DESC'

  const preparedArticles: Array<PreparedArticles> = prepareArticles(getChildArticles(currentPath, start, count, sort))

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
  return query({
    start: start,
    count: count,
    query: `_path LIKE "/content${currentPath}*"`,
    filters: {
      boolean: {
        must: [
          {
            exists: {
              field: 'publish.from'
            }
          }
        ]
      }
    },
    contentTypes: [`${app.name}:article`],
    sort: `publish.from ${sort}`
  })
}

function prepareArticles(articles: QueryResponse<Article>): Array<PreparedArticles> {
  totalCount = articles.total
  return articles.hits.map((article: Content<Article>) => {
    return {
      title: article.displayName,
      preface: article.data.ingress ? article.data.ingress : '',
      url: pageUrl({
        id: article._id
      }),
      publishDate: article.publish && article.publish.from ? article.publish.from : '',
      publishDateHuman: article.publish && article.publish.from ? moment(article.publish.from).format('Do MMMM YYYY') : ''
    }
  })
}

interface PreparedArticles {
    title: string;
    preface: string;
    url: string;
    publishDate: string;
}
