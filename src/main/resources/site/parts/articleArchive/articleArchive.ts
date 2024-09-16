import { query, type Content } from '/lib/xp/content'
import { getContent, pageUrl, processHtml, serviceUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { render } from '/lib/enonic/react4xp'
import { formatDate } from '/lib/ssb/utils/dateUtils'
import { imageUrl, getImageAlt, generateSrcSet } from '/lib/ssb/utils/imageUtils'

import { renderError } from '/lib/ssb/error/error'
import {
  type ArticleArchiveProps,
  type ParsedArticles,
  type ParsedArticleData,
} from '/lib/types/partTypes/articleArchive'
import { type Article, type ArticleArchive } from '/site/content-types'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request) {
  const page = getContent<Content<ArticleArchive>>()
  if (!page) throw Error('No page found')

  const language: string = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  const listOfArticlesTitle: string = localize({
    key: 'articleAnalysisPublications',
    locale: language,
  })

  const title: string | undefined = page.displayName ? page.displayName : undefined

  const preamble: string | undefined = page.data.preamble ? page.data.preamble : undefined

  //IMAGE
  const image: string | undefined = page.data.image
    ? imageUrl({
        id: page.data.image,
        scale: 'block(1180, 275)',
        format: 'jpg',
      })
    : undefined

  const imageSrcSet: { mobile: string; tablet: string; desktop: string } | undefined = page.data.image
    ? generateSrcSet(page.data.image)
    : undefined

  const imageAltText: string | undefined = page.data.image ? getImageAlt(page.data.image) : ' '

  const freeText: string | undefined = page.data.freeText
    ? processHtml({
        value: page.data.freeText.replace(/&nbsp;/g, ' '),
      })
    : undefined

  const issnNumber: string | undefined = page.data.issnNumber ? 'ISSN ' + page.data.issnNumber : undefined

  const props: ArticleArchiveProps = {
    title,
    preamble,
    image,
    imageSrcSet,
    imageAltText,
    freeText,
    issnNumber,
    listOfArticlesSectionTitle: listOfArticlesTitle,
    language: language,
    pageId: page._id,
    firstArticles: parseArticleData(page._id, 0, 15, language),
    articleArchiveService: serviceUrl({
      service: 'articleArchive',
    }),
    showMore: localize({
      key: 'button.showMore',
      locale: language,
    }),
    showMorePagination: localize({
      key: 'articleArchive.showMore',
      locale: language,
    }),
  }

  return render('ArticleArchive', props, req, {
    body: '<section class="xp-part article-archive"></section>',
  })
}

function getSubTitle(articleContent: Content<Article>, articleNamePhrase: string, language: string): string {
  let type = ''
  if (articleContent.type === `${app.name}:article`) {
    type = articleNamePhrase
  }

  let prettyDate: string | undefined = ''
  if (articleContent.publish && articleContent.publish.from) {
    prettyDate = formatDate(articleContent.publish.from, 'PPP', language)
  } else {
    prettyDate = formatDate(articleContent.createdTime, 'PPP', language)
  }

  return `${type ? `${type} / ` : ''}${prettyDate ? prettyDate : ''}`
}

export function parseArticleData(pageId: string, start: number, count: number, language: string): ParsedArticles {
  const articles = query<Content<Article>>({
    start,
    count,
    sort: 'publish.from DESC',
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'language',
              values: language === 'en' ? ['en'] : ['no', 'nb', 'nn'],
            },
          },
          {
            hasValue: {
              field: 'data.articleArchive',
              values: [pageId],
            },
          },
          {
            hasValue: {
              field: 'type',
              values: [`${app.name}:article`],
            },
          },
        ],
      },
    },
  })

  const parsedArticles: Array<ParsedArticleData> = articles.hits.map((articleContent) => {
    const articleType = articleContent.data.articleType
      ? `contentType.search.${articleContent.data.articleType}`
      : 'articleName'
    const articleNamePhrase: string = localize({
      key: articleType,
      locale: language,
    })
    return {
      year:
        // checking against an empty articleContent.publish object to throw a false
        JSON.stringify(articleContent.publish) != '{}' && articleContent.createdTime
          ? formatDate(articleContent.publish?.from, 'yyyy', language)
          : formatDate(articleContent.createdTime, 'yyyy', language),
      subtitle: getSubTitle(articleContent, articleNamePhrase, language),
      href: pageUrl({
        id: articleContent._id,
      }),
      title: articleContent.displayName,
      preamble: articleContent.data.ingress,
      date: articleContent.publish && articleContent.publish.from ? articleContent.publish.from : '',
    }
  })

  return {
    articles: parsedArticles,
    total: articles.total,
  }
}
