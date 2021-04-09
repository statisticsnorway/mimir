import { Request, Response } from 'enonic-types/controller'
import { Content, ContentLibrary, QueryResponse } from 'enonic-types/content'
import { Article } from '../../content-types/article/article'
import { PortalLibrary } from 'enonic-types/portal'
import { ThymeleafLibrary, ResourceKey } from 'enonic-types/thymeleaf'

// eslint-disable-next-line @typescript-eslint/typedef
const moment = require('moment/min/moment-with-locales')
moment.locale('nb')


const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')

const {
  pageUrl
}: PortalLibrary = __non_webpack_require__('/lib/xp/portal')
const {
  render
}: ThymeleafLibrary = __non_webpack_require__('/lib/thymeleaf')

const view: ResourceKey = resolve('./articleList.html')

exports.get = (req: Request): Response => {
  return renderPart(req)
}

exports.preview = (req: Request): Response => renderPart(req)

function renderPart(req: Request): Response {
  const articles: QueryResponse<Article> = getArticles()
  const preparedArticles: Array<PreparedArticles> = prepareArticles(articles)
  const props: PartProperties = {
    title: 'Nye artikler, analyser og publikasjoner',
    articles: preparedArticles
  }
  log.info(JSON.stringify(props, null, 2))
  return {
    body: render(view, props)

  }
}
// TODO: Url til artikkelarkiv nederst
// TOOD: query:`data.showOnFrontPage`

function getArticles(): QueryResponse<Article> {
  const q: QueryResponse<Article> = query({
    count: 4,
    query: ``,
    contentTypes: [`${app.name}:article`]
  })
  // log.info(JSON.stringify(q, null, 2))
  return q
}

function prepareArticles(articles: QueryResponse<Article>): Array<PreparedArticles> {
  return articles.hits.map( (article: Content<Article>) => {
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

interface PartProperties {
  title: string;
  articles: Array<PreparedArticles>;
}
