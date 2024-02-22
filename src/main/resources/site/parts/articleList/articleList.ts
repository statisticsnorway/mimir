import { pageUrl, getContent, getComponent } from '/lib/xp/portal'
import { query, type Content } from '/lib/xp/content'
import { localize } from '/lib/xp/i18n'
import { render } from '/lib/enonic/react4xp'
import { getSubSubjects } from '/lib/ssb/utils/subjectUtils'
import { formatDate } from '/lib/ssb/utils/dateUtils'

import { renderError } from '/lib/ssb/error/error'
import { fromPartCache } from '/lib/ssb/cache/partCache'
import { isEnabled } from '/lib/featureToggle'
import { type Article } from '/site/content-types'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request) {
  const content = getContent()
  if (!content) throw Error('No page found')

  const articleListCacheDisabled = isEnabled('deactivate-part-cache-article-list', true, 'ssb')
  if (req.mode === 'edit' || req.mode === 'inline' || articleListCacheDisabled) {
    return getArticleList(req, content)
  } else {
    return fromPartCache(req, `${content._id}-articleList`, () => getArticleList(req, content))
  }
}

function getArticleList(req: XP.Request, content: Content) {
  const component = getComponent<XP.PartComponent.ArticleList>()
  if (!component) throw Error('No component found')

  const language = content.language ? content.language : 'nb'
  const articles = getArticles(req, language)
  const preparedArticles = prepareArticles(articles, language)

  const archiveLinkText = localize({
    key: 'publicationLinkText',
    locale: language,
  })
  const headerText = localize({
    key: 'articleList.heading',
    locale: language,
  })

  const props = {
    title: headerText,
    articles: preparedArticles,
    archiveLinkText: archiveLinkText,
    archiveLinkUrl: component.config.pubArchiveUrl ? component.config.pubArchiveUrl : '#',
  }
  return render('site/parts/articleList/articleList', props, req)
}

function getArticles(req: XP.Request, language: string) {
  const subjectItems = getSubSubjects(req, language)
  const pagePaths = subjectItems.map((sub) => `_parentPath LIKE "/content${sub.path}/*"`)

  const sort = [
    {
      field: 'publish.from',
      direction: 'DESC',
    },
    {
      field: 'data.frontPagePriority',
      direction: 'DESC',
    },
  ]
  const articles = query({
    count: 4,
    query: `(${pagePaths.join(' OR ')})`,
    contentTypes: [`${app.name}:article`],
    sort: sort as unknown as string,
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'language',
              values: language === 'en' ? ['en'] : ['no', 'nb', 'nn'],
            },
          },
        ],
        mustNot: {
          hasValue: {
            field: 'data.frontPagePriority',
            values: ['hideArticle'],
          },
        },
      },
    },
  }).hits as unknown as Array<Content<Article>>
  return articles
}

function prepareArticles(articles: Array<Content<Article>>, language: string) {
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
