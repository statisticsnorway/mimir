import { XData } from 'site/x-data'
import { Article } from '../../../site/content-types/article/article'
import {
  getAllMainSubjectByContent,
  getAllSubSubjectByContent,
  getMainSubjects,
  getSubSubjects,
  type SubjectItem,
} from '../utils/subjectUtils'
import { formatDate } from './dateUtils'
import { notNullOrUndefined } from '/lib/ssb/utils/coreUtils'
import { get, modify, query, type Content, type QueryResponse } from '/lib/xp/content'
import { pageUrl } from '/lib/xp/portal'
import { listener, EnonicEvent } from '/lib/xp/event'
import { ENONIC_CMS_DEFAULT_REPO, withSuperUserContext } from '/lib/ssb/repo/common'
import { arraysEqual, ensureArray } from './arrayUtils'

const { moment } = __non_webpack_require__('/lib/vendor/moment')

const dummyReq: Partial<XP.Request> = {
  branch: 'master',
}

export function setupArticleListener(): void {
  listener({
    type: 'node.updated',
    localOnly: true,
    callback: (event: EnonicEvent) => {
      const eventContent: Content<Article, XData> | null = get({ key: event.data.nodes[0].id })
      if (eventContent?.type == 'mimir:article') {
        try {
          const start = Date.now()
          // @ts-ignore <- needs to be here, we don't want to create a whole req
          addSubjectToXData(eventContent, dummyReq)

          const end = Date.now()
          log.info(`Runtime for adding subjectData: ${end - start}ms`)
        } catch (error) {
          log.error(`Error while trying to add Subject to Article, error: ${JSON.stringify(error, null, 2)}`)
        }
      }
    },
  })
}

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

export function addSubjectToXData(
  article: Content<Article, XData>,
  req: XP.Request
): Content<Article, XData> | undefined {
  const allMainSubjects: SubjectItem[] = getMainSubjects(req, 'nb')
  const allSubSubjects: SubjectItem[] = getSubSubjects(req, 'nb')

  const mainSubjects: string[] = getAllMainSubjectByContent(article, allMainSubjects, allSubSubjects)
    .map((subject) => subject.name)
    .filter(notNullOrUndefined)
  const subSubjects: string[] = getAllSubSubjectByContent(article, allSubSubjects)
    .map((subject) => subject.name)
    .filter(notNullOrUndefined)

  if (mainSubjects.length && subSubjects.length && shouldEdit(mainSubjects, subSubjects, article)) {
    let modified: Content<Article, XData> | undefined
    try {
      modified = withSuperUserContext(ENONIC_CMS_DEFAULT_REPO, 'draft', () => {
        return modify({
          key: article._id,
          requireValid: true,
          editor: (content: Content<Article, XData>) => {
            content.x = {
              ...content.x,
              mimir: {
                subjectTag: {
                  mainSubjects: mainSubjects,
                  subSubjects: subSubjects,
                },
              },
            }
            return content
          },
        })
      })
    } catch (error) {
      log.error(`Error in editing content for subjectTags, error: ${JSON.stringify(error, null, 2)}`)
    }
    return modified
  }
  return undefined
}

function shouldEdit(
  mainSubjects: Array<string>,
  subSubjects: Array<string>,
  article: Content<Article, XData>
): boolean {
  const mainIdentical: boolean = arraysEqual(
    ensureArray(mainSubjects),
    ensureArray(article.x.mimir?.subjectTag?.mainSubjects)
  )
  const subIdentical: boolean = arraysEqual(
    ensureArray(subSubjects),
    ensureArray(article.x.mimir?.subjectTag?.subSubjects)
  )
  // Should skip editing if content already contains xdata equal to what it should have
  if (mainIdentical && subIdentical) return false
  else return true
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
