import type { Article } from '../../content-types/article/article'
import { pageUrl, getContent, getComponent, type Component } from '/lib/xp/portal'
import type { ArticleListPartConfig } from './articleList-part-config'
import { render, type RenderResponse } from '/lib/enonic/react4xp'
import { query, type AggregationsResponseEntry, type Content } from '/lib/xp/content'
import type { SubjectItem } from '/lib/ssb/utils/subjectUtils'
import { formatDate } from '/lib/ssb/utils/dateUtils'
import { localize } from '/lib/xp/i18n'

const { moment } = __non_webpack_require__('/lib/vendor/moment')
const { getSubSubjects } = __non_webpack_require__('/lib/ssb/utils/subjectUtils')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { fromPartCache } = __non_webpack_require__('/lib/ssb/cache/partCache')
const { isEnabled } = __non_webpack_require__('/lib/featureToggle')

export function get(req: XP.Request): RenderResponse | XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): RenderResponse {
  return renderPart(req)
}

function renderPart(req: XP.Request): RenderResponse {
  const content: Content = getContent()
  const articleListCacheDisabled: boolean = isEnabled('deactivate-part-cache-article-list', true, 'ssb')
  if (req.mode === 'edit' || req.mode === 'inline' || articleListCacheDisabled) {
    return getArticleList(req, content)
  } else {
    return fromPartCache(req, `${content._id}-articleList`, () => getArticleList(req, content))
  }
}

function getArticleList(req: XP.Request, content: Content): RenderResponse {
  const component: Component<ArticleListPartConfig> = getComponent()
  const language: string = content.language ? content.language : 'nb'
  const articles: Array<Content<Article>> = getArticles(req, language)
  const preparedArticles: Array<PreparedArticles> = prepareArticles(articles, language)

  const archiveLinkText: string = localize({
    key: 'publicationLinkText',
    locale: language,
  })
  const headerText: string = localize({
    key: 'articleList.heading',
    locale: language,
  })

  const props: PartProperties = {
    title: headerText,
    articles: preparedArticles,
    archiveLinkText: archiveLinkText,
    archiveLinkUrl: component.config.pubArchiveUrl ? component.config.pubArchiveUrl : '#',
  }

  return render('site/parts/articleList/articleList', props, req)
}

function getArticles(req: XP.Request, language: string): Array<Content<Article>> {
  const subjectItems: Array<SubjectItem> = getSubSubjects(req, language)
  const pagePaths: Array<string> = subjectItems.map((sub) => `_parentPath LIKE "/content${sub.path}/*"`)
  const languageQuery: string = language !== 'en' ? 'AND language != "en"' : 'AND language = "en"'
  const byDay: AggregationsResponseEntry = query({
    count: 0,
    query: `(${pagePaths.join(' OR ')}) ${languageQuery}`,
    contentTypes: [`${app.name}:article`],
    aggregations: {
      by_day: {
        dateHistogram: {
          field: 'publish.from',
          interval: '1d',
          minDocCount: 1,
          format: 'yyyy-MM-dd',
        },
      },
    },
  }).aggregations.by_day
  byDay.buckets.sort((a, b) => {
    return new Date(b.key).getTime() - new Date(a.key).getTime()
  })
  let start: moment.Moment = moment()
  let end: moment.Moment = moment()
  const count: number = byDay.buckets.reduce((count, day, index) => {
    if (index === 0) start = moment(`${day.key}T23:59:59.000Z`)
    if (count <= 4) {
      end = moment(`${day.key}T00:00:00.000Z`)
    }
    return (count += day.docCount)
  }, 0)
  const articles: Array<Content<Article>> = query({
    count: count,
    query: `(${pagePaths.join(
      ' OR '
    )}) ${languageQuery} AND range("publish.from", instant("${end.toISOString()}"), instant("${start.toISOString()}"))`,
    contentTypes: [`${app.name}:article`],
    sort: `publish.from DESC`,
  }).hits as unknown as Array<Content<Article>>
  return articles
    .sort((a, b) => {
      if (moment(a.publish?.from).isSame(moment(b.publish?.from), 'day')) {
        if (a.data.frontPagePriority === '1' && b.data.frontPagePriority === '0') {
          return -1
        } else if (a.data.frontPagePriority === '0' && b.data.frontPagePriority === '1') {
          return 1
        }
      }
      return 0
    })
    .slice(0, 4)
}

function prepareArticles(articles: Array<Content<Article>>, language: string): Array<PreparedArticles> {
  return articles.map((article: Content<Article>) => {
    return {
      title: article.displayName,
      preface: article.data.ingress ? article.data.ingress : '',
      url: pageUrl({
        id: article._id,
      }),
      publishDate: article.publish && article.publish.from ? article.publish.from : '',
      publishDateHuman:
        article.publish && article.publish.from ? formatDate(article.publish.from, 'PPP', language) : '',
      frontPagePriority: article.data.frontPagePriority,
    }
  })
}

interface PreparedArticles {
  title: string
  preface: string
  url: string
  publishDate: string
}

interface PartProperties {
  title: string
  articles: Array<PreparedArticles>
  archiveLinkText: string
  archiveLinkUrl: string
}
