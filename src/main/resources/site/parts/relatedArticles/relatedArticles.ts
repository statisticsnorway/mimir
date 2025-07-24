import { type Content, get as getContentByKey, query } from '/lib/xp/content'
import { getContent, type ImageUrlParams, pageUrl } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { type Phrases } from '/lib/types/language'
import { render as r4xpRender } from '/lib/enonic/react4xp'

import { formatDate } from '/lib/ssb/utils/dateUtils'
import {
  type ReleaseDatesVariant,
  type StatisticInListing,
  type VariantInListing,
} from '/lib/ssb/dashboard/statreg/types'
import { imageUrl, getImageAlt, getXPContentImage } from '/lib/ssb/utils/imageUtils'
import { getProfiledCardAriaLabel, getSubTitle } from '/lib/ssb/utils/utils'

import { renderError } from '/lib/ssb/error/error'
import * as util from '/lib/util'
import { getReleaseDatesByVariants, getStatisticByIdFromRepo } from '/lib/ssb/statreg/statistics'
import { getPhrases } from '/lib/ssb/utils/language'
import { fromRelatedArticlesCache } from '/lib/ssb/cache/cache'
import { hasWritePermissionsAndPreview } from '/lib/ssb/parts/permissions'
import { type RelatedArticle, type RelatedArticlesContent } from '/lib/types/partTypes/relatedArticles'
import { type RelatedArticles } from '/site/mixins/relatedArticles'
import { type Article, type Statistics } from '/site/content-types'

const view = resolve('./relatedArticles.html')

export function get(req: XP.Request): XP.Response {
  try {
    const page = getContent<Content<Article>>()
    if (!page) throw Error('No page found')

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
  const page = getContent<Content<Article>>()
  if (!page) throw Error('No page found')

  const language: string = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  const phrases = getPhrases(page) as Phrases
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
              const articleContent: Content<Article> | null = getContentByKey({
                key: article.article.article,
              })

              if (!articleContent) {
                return undefined
              }

              const imageWidth = 320
              const imageHeight = 180
              const imageDimensions = {
                scale: `block(${imageWidth}, ${imageHeight})` as ImageUrlParams['scale'], // 16:9
                format: 'jpg',
                placeholderWidth: imageWidth,
                placeholderHeight: imageHeight,
              }
              const { imageSrc, imageAlt } = getXPContentImage(articleContent, imageDimensions)

              const subTitle = getSubTitle(articleContent, language) ?? ''
              return {
                title: articleContent.displayName,
                subTitle,
                preface: articleContent.data.ingress,
                href: pageUrl({
                  id: articleContent._id,
                }),
                imageSrc,
                imageAlt,
                ariaLabel: getProfiledCardAriaLabel(subTitle),
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
              ariaLabel: getProfiledCardAriaLabel(subTitle),
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

function addDsArticle(
  page: Content<Statistics | Article>,
  relatedArticles: RelatedArticles['relatedArticles'],
  showPreview: boolean
): RelatedArticles['relatedArticles'] {
  const statisticId: string = page._id
  const statisticData: Statistics = page.data as Statistics
  const dsArticleType: string = statisticData.dsArticle ?? 'default'
  const statistic: StatisticInListing | undefined = getStatisticByIdFromRepo(statisticData.statistic)

  if (statistic) {
    const variants: Array<VariantInListing | undefined> = util.data.forceArray(statistic.variants)
    const releaseDates: ReleaseDatesVariant = getReleaseDatesByVariants(variants as Array<VariantInListing>)
    const nextRelease: string = releaseDates.nextRelease[0]
    const previousRelease: string = releaseDates.previousRelease[0]
    const statisticPublishDate: string = showPreview && nextRelease !== '' ? nextRelease : previousRelease

    const associatedArticle: RelatedArticle | undefined = getDsArticle(statisticId, statisticPublishDate, dsArticleType)

    if (associatedArticle && relatedArticles) {
      relatedArticles.unshift(associatedArticle)
    }
  }

  return relatedArticles
}

function getDsArticle(
  statisticId: string,
  statisticPublishDate: string,
  dsArticleType: string
): RelatedArticle | undefined {
  statisticPublishDate = statisticPublishDate ? new Date(statisticPublishDate).toLocaleDateString() : ''

  const queryString =
    dsArticleType === 'lastArticle'
      ? `data.associatedStatistics.XP.content = "${statisticId}"`
      : `data.associatedStatistics.XP.content = "${statisticId}" AND publish.from LIKE "${statisticPublishDate}*" `

  const sort = 'publish.from DESC'

  const articleContent: Array<Content<Statistics | Article>> = query({
    count: 1,
    sort,
    query: queryString,
    contentTypes: [`${app.name}:article`],
  }).hits as unknown as Array<Content<Statistics | Article>>

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
