import { Content } from 'enonic-types/content'
import { PageContributions, Request, Response } from 'enonic-types/controller'
import { ResourceKey } from 'enonic-types/thymeleaf'
import { ReleaseDatesVariant, StatisticInListing, VariantInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { formatDate } from '../../../lib/ssb/utils/dateUtils'
import { Phrases } from '../../../lib/types/language'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'
import { SEO } from '../../../services/news/news'
import { Article } from '../../content-types/article/article'
import { Statistics } from '../../content-types/statistics/statistics'
import { RelatedArticles } from '../../mixins/relatedArticles/relatedArticles'

const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getContent,
  pageUrl,
  imageUrl,
  imagePlaceholder
} = __non_webpack_require__('/lib/xp/portal')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const util = __non_webpack_require__('/lib/util')
const {
  getImageAlt
} = __non_webpack_require__('/lib/ssb/utils/imageUtils')
const {
  getReleaseDatesByVariants
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  fromRelatedArticlesCache
} = __non_webpack_require__('/lib/ssb/cache/cache')
const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  hasWritePermissionsAndPreview
} = __non_webpack_require__('/lib/ssb/parts/permissions')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')
const contentLib = __non_webpack_require__('/lib/xp/content')

const view: ResourceKey = resolve('./relatedArticles.html')

exports.get = function(req: Request): Response {
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

exports.preview = (req: Request, relatedArticles: RelatedArticles['relatedArticles']) => renderPart(req, relatedArticles)

function renderPart(req: Request, relatedArticles: RelatedArticles['relatedArticles']): Response {
  const page: Content<Article> = getContent()
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
          heading: phrases.relatedArticlesHeading
        })
      }
    }
    return {
      body: null
    }
  }

  const relatedArticlesComponent: React4xpObject = new React4xp('RelatedArticles')
    .setProps({
      relatedArticles: relatedArticles.map((article) => {
        if (article._selected === 'article') {
          return fromRelatedArticlesCache(req, article.article.article, () => {
            const articleContent: Content<Article, object, SEO> | null = get({
              key: article.article.article
            })

            if (!articleContent) {
              return undefined
            }

            let imageSrc: string | undefined
            let imageAlt: string | undefined = ' '

            if (!articleContent.x ||
                !articleContent.x['com-enonic-app-metafields'] ||
                !articleContent.x['com-enonic-app-metafields']['meta-data'] ||
                !articleContent.x['com-enonic-app-metafields']['meta-data'].seoImage) {
              imageSrc = imagePlaceholder({
                width: 320,
                height: 180
              })
            } else { // use placeholder if there is no seo image on the article
              const image: string = articleContent.x['com-enonic-app-metafields']['meta-data'].seoImage
              imageSrc = imageUrl({
                id: image,
                scale: 'block(320, 180)' // 16:9
              })
              imageAlt = getImageAlt(image) ? getImageAlt(image) : ' '
            }


            return {
              title: articleContent.displayName,
              subTitle: getSubTitle(articleContent, phrases, language),
              preface: articleContent.data.ingress,
              href: pageUrl({
                id: articleContent._id
              }),
              imageSrc,
              imageAlt
            }
          })
        } else if (article._selected === 'externalArticle') {
          const imageSrc: string = imageUrl({
            id: article.externalArticle.image,
            scale: 'block(320, 180)' // 16:9
          })
          const imageAlt: string | undefined = getImageAlt(article.externalArticle.image)
          let subTitle: string = ''
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
            imageAlt
          }
        }
        return null
      }).filter((article) => !!article) as unknown as Array<RelatedArticlesContent>,
      showAll: phrases.showAll,
      showLess: phrases.showLess,
      heading: phrases.relatedArticlesHeading
    })
    .setId('related-articles')
    .uniqueId()

  const body: string = render(view, {
    relatedArticlesId: relatedArticlesComponent.react4xpId,
    heading: phrases.relatedArticlesHeading
  })
  return {
    body: relatedArticlesComponent.renderBody({
      body
    }),
    pageContributions: relatedArticlesComponent.renderPageContributions() as PageContributions
  }
}


function getSubTitle(articleContent: Content<Article, object, SEO> | null, phrases: Phrases, language: string): string | undefined {
  if (articleContent) {
    let type: string = ''
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
  page: Content<Statistics | Article, object, SEO>,
  relatedArticles: RelatedArticles['relatedArticles'],
  showPreview: boolean): RelatedArticles['relatedArticles'] {
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
  statisticPublishDate = moment(new Date(statisticPublishDate)).format('YYYY-MM-DD')
  const articleContent: Array<Content<Statistics | Article, object, SEO>> = contentLib.query({
    count: 1,
    sort: 'publish.from DESC',
    query: `data.associatedStatistics.XP.content = "${statisticId}" AND publish.from LIKE "${statisticPublishDate}*" `,
    contentTypes: [
      `${app.name}:article`
    ]
  }).hits as unknown as Array<Content<Statistics | Article, object, SEO>>

  const articleObject: RelatedArticle | undefined = articleContent.length > 0 ? {
    _selected: 'article',
    article: {
      article: articleContent[0]._id
    }
  } : undefined

  return articleObject
}

interface RelatedArticlesContent {
  title: string;
  subTitle: string,
  preface: string,
  href: string;
  imageSrc: string;
  imageAlt: string;
}

interface RelatedArticle {
  _selected: 'article';
  article: {
    article: string;
  };
}
