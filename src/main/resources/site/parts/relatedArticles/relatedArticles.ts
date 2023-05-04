import { type Content, get as getContentByKey, query } from '/lib/xp/content'
import { render, type ResourceKey } from '/lib/thymeleaf'
import type { ReleaseDatesVariant, StatisticInListing, VariantInListing } from '/lib/ssb/dashboard/statreg/types'
import { formatDate } from '/lib/ssb/utils/dateUtils'
import type { Phrases } from '/lib/types/language'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { SEO } from '/services/news/news'
import type { Article, Statistics } from '/site/content-types'
import type { RelatedArticles } from '/site/mixins/relatedArticles'

import { getContent, pageUrl, imageUrl, imagePlaceholder } from '/lib/xp/portal'
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const util = __non_webpack_require__('/lib/util')
const { getImageAlt } = __non_webpack_require__('/lib/ssb/utils/imageUtils')
const { getReleaseDatesByVariants } = __non_webpack_require__('/lib/ssb/statreg/statistics')
const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')
const { fromRelatedArticlesCache } = __non_webpack_require__('/lib/ssb/cache/cache')
const { getStatisticByIdFromRepo } = __non_webpack_require__('/lib/ssb/statreg/statistics')
const { hasWritePermissionsAndPreview } = __non_webpack_require__('/lib/ssb/parts/permissions')

const view: ResourceKey = resolve('./relatedArticles.html')

export function get(req: XP.Request): XP.Response {
  try {
    const page: Content<Article> = getContent()
    let relatedArticles: RelatedArticles['relatedArticles'] = page.data.relatedArticles
    if (relatedArticles) {
      relatedArticles = util.data.forceArray(relatedArticles)
    } else {
      relatedArticles = []
    }
    return renderPart(req, relatedArticles)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, relatedArticles: RelatedArticles['relatedArticles']) {
  return renderPart(req, relatedArticles)
}

function renderPart(req: XP.Request, relatedArticles: RelatedArticles['relatedArticles']): XP.Response {
  const page: Content<Article, SEO> = getContent()
  const language: string = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  const phrases: Phrases = getPhrases(page)
  const showPreview: boolean = (req.params.showDraft && hasWritePermissionsAndPreview(req, page._id)) as boolean
  if (page.type === `${app.name}:statistics`) {
    addDsArticle(page, relatedArticles, showPreview)
  }

  if (!relatedArticles || relatedArticles.length === 0) {
    if (req.mode === 'edit' && page.type !== `${app.name}:article` && page.type !== `${app.name}:statistics`) {
      return {
        body: render(view, {
          heading: phrases.relatedArticlesHeading,
        }),
      }
    }
    return {
      body: null,
    }
  }

  const id = 'related-articles'
  const body: string = render(view, {
    relatedArticlesId: id,
  })

  return r4xpRender(
    'RelatedArticles',
    {
      relatedArticles: relatedArticles
        .map((article) => {
          if (article._selected === 'article') {
            return fromRelatedArticlesCache(req, article.article.article, () => {
              const articleContent: Content<Article, SEO> | null = getContentByKey({
                key: article.article.article,
              })

              if (!articleContent) {
                return undefined
              }

              let imageSrc: string | undefined
              let imageAlt: string | undefined = ' '

              if (!articleContent.x['com-enonic-app-metafields']['meta-data'].seoImage) {
                imageSrc = imagePlaceholder({
                  width: 320,
                  height: 180,
                })
              } else {
                // use placeholder if there is no seo image on the article
                const image: string = articleContent.x['com-enonic-app-metafields']['meta-data'].seoImage
                imageSrc = imageUrl({
                  id: image,
                  scale: 'block(320, 180)', // 16:9
                  format: 'jpg',
                })
                imageAlt = getImageAlt(image) ? getImageAlt(image) : ' '
              }

              return {
                title: articleContent.displayName,
                subTitle: getSubTitle(articleContent, phrases, language),
                preface: articleContent.data.ingress,
                href: pageUrl({
                  id: articleContent._id,
                }),
                imageSrc,
                imageAlt,
              }
            })
          } else if (article._selected === 'externalArticle') {
            const imageSrc: string = imageUrl({
              id: article.externalArticle.image,
              scale: 'block(320, 180)', // 16:9
              format: 'jpg',
            })
            const imageAlt: string | undefined = getImageAlt(article.externalArticle.image)
            let subTitle = ''
            if (article.externalArticle.type) {
              subTitle = article.externalArticle.type
            }
            if (article.externalArticle.date) {
              const prettyDate: string | undefined = formatDate(article.externalArticle.date, 'PPP', language)
              subTitle += prettyDate && `${subTitle ? ' / ' : ''}${prettyDate}`
            }

            return {
              title: article.externalArticle.title,
              subTitle,
              preface: article.externalArticle.preface,
              href: article.externalArticle.url,
              imageSrc,
              imageAlt,
            }
          }
          return null
        })
        .filter((article) => !!article) as unknown as Array<RelatedArticlesContent>,
      showAll: phrases.showAll,
      showLess: phrases.showLess,
      heading: phrases.relatedArticlesHeading,
      showAllAriaLabel: phrases['button.showAll'],
      articlePluralName: phrases.articlePluralName,
      showingPhrase: phrases['publicationArchive.showing'],
    },
    req,
    {
      id: id,
      body: body,
    }
  )
}

function getSubTitle(
  articleContent: Content<Article, SEO> | null,
  phrases: Phrases,
  language: string
): string | undefined {
  if (articleContent) {
    let type = ''
    if (articleContent.type === `${app.name}:article`) {
      type = phrases.articleName
    }
    let prettyDate: string | undefined = ''
    if (articleContent.publish && articleContent.publish.from) {
      prettyDate = formatDate(articleContent.publish.from, 'PPP', language)
    } else {
      prettyDate = formatDate(articleContent.createdTime, 'PPP', language)
    }
    return `${type ? `${type} / ` : ''}${prettyDate as string}`
  }
  return
}

function addDsArticle(
  page: Content<Statistics | Article, SEO>,
  relatedArticles: RelatedArticles['relatedArticles'],
  showPreview: boolean
): RelatedArticles['relatedArticles'] {
  const statisticId: string = page._id
  const statisticData: Statistics = page.data as Statistics
  const statistic: StatisticInListing | undefined = getStatisticByIdFromRepo(statisticData.statistic)

  if (statistic) {
    const variants: Array<VariantInListing | undefined> = util.data.forceArray(statistic.variants)
    const releaseDates: ReleaseDatesVariant = getReleaseDatesByVariants(variants as Array<VariantInListing>)
    const nextRelease: string = releaseDates.nextRelease[0]
    const previousRelease: string = releaseDates.previousRelease[0]
    const statisticPublishDate: string = showPreview && nextRelease !== '' ? nextRelease : previousRelease
    const assosiatedArticle: RelatedArticle | undefined = getDsArticle(statisticId, statisticPublishDate)

    if (assosiatedArticle && relatedArticles) {
      relatedArticles.unshift(assosiatedArticle)
    }
  }

  return relatedArticles
}

function getDsArticle(statisticId: string, statisticPublishDate: string): RelatedArticle | undefined {
  statisticPublishDate = statisticPublishDate ? new Date(statisticPublishDate).toLocaleDateString() : ''

  const articleContent: Array<Content<Statistics | Article, SEO>> = query({
    count: 1,
    sort: 'publish.from DESC',
    query: `data.associatedStatistics.XP.content = "${statisticId}" AND publish.from LIKE "${statisticPublishDate}*" `,
    contentTypes: [`${app.name}:article`],
  }).hits as unknown as Array<Content<Statistics | Article, SEO>>

  const articleObject: RelatedArticle | undefined =
    articleContent.length > 0
      ? {
          _selected: 'article',
          article: {
            article: articleContent[0]._id,
          },
        }
      : undefined

  return articleObject
}

interface RelatedArticlesContent {
  title: string
  subTitle: string
  preface: string
  href: string
  imageSrc: string
  imageAlt: string
}

interface RelatedArticle {
  _selected: 'article'
  article: {
    article: string
  }
}
