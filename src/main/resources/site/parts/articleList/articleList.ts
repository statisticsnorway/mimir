import { type Request, type Response } from '@enonic-types/core'
import { getContent, getComponent } from '/lib/xp/portal'
import { query, type Content } from '/lib/xp/content'
import { localize } from '/lib/xp/i18n'
import { render } from '/lib/enonic/react4xp'
import { getSubSubjects } from '/lib/ssb/utils/subjectUtils'

import { renderError } from '/lib/ssb/error/error'
import { fromPartCache } from '/lib/ssb/cache/partCache'
import { isEnabled } from '/lib/featureToggle'
import { prepareArticles } from '/lib/ssb/utils/articleUtils'
import { type Article } from '/site/content-types'

export function get(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: Request) {
  return renderPart(req)
}

function renderPart(req: Request) {
  const content = getContent()
  if (!content) throw Error('No page found')

  const articleListCacheDisabled = isEnabled('deactivate-part-cache-article-list', true, 'ssb')
  if (req.mode === 'edit' || req.mode === 'inline' || articleListCacheDisabled) {
    return getArticleList(req, content)
  } else {
    return fromPartCache(req, `${content._id}-articleList`, () => getArticleList(req, content))
  }
}

function getArticleList(req: Request, content: Content) {
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
  return render('site/parts/articleList/articleList', props, req, { hydrate: false })
}

function getArticles(req: Request, language: string) {
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
