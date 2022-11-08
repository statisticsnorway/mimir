import type { Article } from '../../../site/content-types/'
import { query, Content, QueryResponse } from '/lib/xp/content'
import { SubjectItem } from '../utils/subjectUtils'
import { formatDate } from './dateUtils'

const { pageUrl } = __non_webpack_require__('/lib/xp/portal')
const { moment } = __non_webpack_require__('/lib/vendor/moment')
const { getMainSubjects } = __non_webpack_require__('/lib/ssb/utils/subjectUtils')

export function getChildArticles(
  currentPath: string,
  subTopicId: string,
  start: number,
  count: number,
  sort: string
): QueryResponse<Article, object> {
  const toDay: string = moment().toISOString()
  return query({
    start: start,
    count: count,
    query: `(_path LIKE "/content${currentPath}*" OR data.subtopic = "${subTopicId}") AND publish.from <= instant("${toDay}")`,
    contentTypes: [`${app.name}:article`],
    sort: `publish.from ${sort}`,
  })
}

export function getAllArticles(req: XP.Request, language: string, start: 0, count: 50): ArticleResult {
  const mainSubjects: Array<SubjectItem> = getMainSubjects(req, language)
  const languageQuery: string = language !== 'en' ? 'AND language != "en"' : 'AND language = "en"'
  const now: string = new Date().toISOString()
  const publishFromQuery = `(publish.from LIKE '*' AND publish.from < '${now}')`
  const pagePaths: Array<string> = mainSubjects.map((mainSubject) => `_parentPath LIKE "/content${mainSubject.path}/*"`)
  const subjectQuery = `(${pagePaths.join(' OR ')})`
  const queryString = `${publishFromQuery} AND ${subjectQuery} ${languageQuery}`

  const articlesContent: QueryResponse<Article, object> = query({
    start: start,
    count: count,
    query: queryString,
    contentTypes: [`${app.name}:article`],
    sort: 'publish.from DESC',
  })

  return {
    articles: prepareArticles(articlesContent, language),
    total: articlesContent.total,
  }
}

export function prepareArticles(articles: QueryResponse<Article, object>, language: string): Array<PreparedArticles> {
  return articles.hits.map((article: Content<Article>) => {
    return {
      title: article.displayName,
      preface: article.data.ingress ? article.data.ingress : '',
      url: pageUrl({
        id: article._id,
      }),
      publishDate: article.publish && article.publish.from ? article.publish.from : '',
      publishDateHuman:
        article.publish && article.publish.from ? formatDate(article.publish.from, 'PPP', language) : '',
    }
  })
}
export interface ArticleUtilsLib {
  getChildArticles: (
    currentPath: string,
    subTopicId: string,
    start: number,
    count: number,
    sort: string
  ) => QueryResponse<Article, object>
  prepareArticles: (articles: QueryResponse<Article, object>, language: string) => Array<PreparedArticles>
  getAllArticles: (req: XP.Request, language: string, start: number, count: number) => ArticleResult
}

export interface PreparedArticles {
  title: string
  preface: string
  url: string
  publishDate: string
}

export interface ArticleResult {
  total: number
  articles: Array<PreparedArticles>
}
