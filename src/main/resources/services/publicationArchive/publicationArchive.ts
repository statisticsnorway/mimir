import { Request, Response } from 'enonic-types/controller'
import { Article } from '../../site/content-types/article/article'
import { Content, QueryResponse } from 'enonic-types/content'
import { Page } from '../../site/content-types/page/page'

const {
  query
} = __non_webpack_require__('/lib/xp/content')
const {
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')

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

function getPublications(start: number = 0, count: number = 10, language: string): PublicationResult {
  const languageQuery: string = language !== 'en' ? 'AND language != "en"' : 'AND language = "en"'
  const mainSubjects: Array<Content<Page>> = query({
    count: 500,
    contentTypes: [`${app.name}:page`],
    query: `components.page.config.mimir.default.subjectType LIKE "mainSubject" ${languageQuery}`
  }).hits as unknown as Array<Content<Page>>

  const pagePaths: Array<string> = mainSubjects.map((mainSubject) => `_parentPath LIKE "/content${mainSubject._path}/*"`)

  const res: QueryResponse<Article> = query({
    start,
    count,
    query: `(${pagePaths.join(' OR ')}) ${languageQuery}`,
    contentTypes: [`${app.name}:article`],
    sort: 'publish.from DESC'
  })

  const publications: Array<PublicationItem> = res.hits.map((article) => {
    const mainSubject: Content<Page> | undefined = mainSubjects.find((mainSubject) => {
      return article._path.startsWith(mainSubject._path)
    })
    return prepareArticle(article, mainSubject, language)
  })

  return {
    publications,
    total: res.total
  }
}

function prepareArticle(article: Content<Article>, mainSubject: Content<Page> | undefined, language: string): PublicationItem {
  return {
    title: article.displayName,
    preface: article.data.ingress ? article.data.ingress : '',
    url: pageUrl({
      id: article._id
    }),
    publishDate: article.publish && article.publish.from ? article.publish.from : '',
    publishDateHuman: article.publish && article.publish.from ? moment(article.publish.from).locale(language).format('Do MMMM YYYY') : '',
    contentType: article.type,
    articleType: article.data.articleType ? article.data.articleType : 'default',
    mainSubject: mainSubject ? mainSubject.displayName : ''
  }
}

interface PublicationResult {
  total: number;
  publications: Array<PublicationItem>;
}

export interface PublicationItem {
  title: string;
  preface: string;
  url: string;
  publishDate: string;
  publishDateHuman: string;
  contentType: string;
  articleType: string;
  mainSubject: string;
}
