import { get as getContentByKey, query, type Content } from '/lib/xp/content'
import type { Phrases } from '/lib/types/language'
import { render } from '/lib/enonic/react4xp'
import type { Article, ContentList } from '/site/content-types'
import type { RelatedFactPage as RelatedFactPagePartConfig } from '.'
import { imagePlaceholder, getComponent, getContent, pageUrl, serviceUrl } from '/lib/xp/portal'
import { imageUrl } from '/lib/ssb/utils/imageUtils'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')
const { getImageAlt } = __non_webpack_require__('/lib/ssb/utils/imageUtils')
const { fromPartCache } = __non_webpack_require__('/lib/ssb/cache/partCache')
const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')

export function get(req: XP.Request): XP.Response {
  try {
    const page = getContent<Content<Article>>()
    if (!page) throw Error('No page found')

    const config = getComponent<XP.PartComponent.RelatedFactPage>()?.config
    if (!config) throw Error('No part found')

    let relatedFactPageConfig: RelatedFactPageConfig | undefined

    if (config.itemList) {
      relatedFactPageConfig = {
        inputType: 'itemList',
        contentIdList: config.itemList,
      }
    }
    if (config.relatedFactPages || page.data.relatedFactPages) {
      let contentIdList: RelatedFactPageConfig['contentIdList'] = []
      if (config.relatedFactPages) {
        contentIdList = forceArray(config.relatedFactPages)
      }
      if (page.data.relatedFactPages) {
        contentIdList = forceArray(page.data.relatedFactPages)
      }
      relatedFactPageConfig = {
        inputType: 'relatedFactPage',
        contentIdList,
      }
    }
    return renderPart(req, relatedFactPageConfig)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, relatedFactPageConfig: RelatedFactPageConfig | undefined): XP.Response {
  return renderPart(req, relatedFactPageConfig)
}

function renderPart(req: XP.Request, relatedFactPageConfig: RelatedFactPageConfig | undefined): XP.Response {
  const page = getContent()
  if (!page) throw Error('No page found')

  if (req.mode === 'edit' || req.mode === 'inline' || !relatedFactPageConfig) {
    return renderRelatedFactPage(req, page, relatedFactPageConfig)
  } else {
    return fromPartCache(req, `${page._id}-relatedFactPage`, () => {
      return renderRelatedFactPage(req, page, relatedFactPageConfig)
    })
  }
}

function renderRelatedFactPage(
  req: XP.Request,
  page: Content,
  relatedFactPageConfig: RelatedFactPageConfig | undefined
): XP.Response {
  const phrases: Phrases = getPhrases(page)
  const config = getComponent<RelatedFactPagePartConfig>()?.config
  if (!config) throw Error('No part found')

  const mainTitle: string = config.title ? config.title : phrases.relatedFactPagesHeading
  const showAll: string = phrases.showAll
  const showLess: string = phrases.showLess

  if (!relatedFactPageConfig) {
    // Render title only on page templates in edit mode
    if (req.mode === 'edit' && page.type !== `${app.name}:article` && page.type !== `${app.name}:statistics`) {
      return render(
        'site/parts/relatedFactPage/relatedFactPage',
        {
          mainTitle,
        },
        req,
        {
          body: `<section class="xp-part part-picture-card"></section>`,
        }
      )
    } else {
      return {
        body: null,
      }
    }
  }

  const firstRelatedContents: RelatedFactPages = parseRelatedFactPageData(relatedFactPageConfig, 0, 4)

  const relatedFactPageServiceUrl: string = serviceUrl({
    service: 'relatedFactPage',
  })

  const props: RelatedFactPageProps = {
    firstRelatedContents,
    relatedFactPageServiceUrl,
    partConfig: relatedFactPageConfig,
    mainTitle,
    showAll,
    showLess,
    factpagePluralName: phrases.relatedFactPagesHeading,
    showingPhrase: phrases['publicationArchive.showing'],
  }

  return render('site/parts/relatedFactPage/relatedFactPage', props, req, {
    body: `<section class="xp-part part-picture-card"></section>`,
  })
}

export function parseRelatedFactPageData(
  relatedFactPageConfig: RelatedFactPageConfig | undefined,
  start: number,
  count: number
): RelatedFactPages {
  const relatedFactPages: Array<RelatedFactPageContent> = []
  let total = 0
  if (relatedFactPageConfig?.contentIdList) {
    let contentListId: Array<string> = relatedFactPageConfig.contentIdList as Array<string>

    // why this? if contentListId is empty [], then:
    if (relatedFactPageConfig.inputType === 'itemList') {
      const relatedContent: RelatedFactPage | null = getContentByKey({
        key: relatedFactPageConfig.contentIdList as string,
      })
      contentListId = forceArray((relatedContent?.data as ContentList).contentList) as Array<string>
    }

    const relatedContentQueryResults = contentListId.length
      ? query({
          count: 999,
          filters: {
            ids: {
              values: contentListId,
            },
          },
        })
      : null

    if (relatedContentQueryResults) {
      const sortedRelatedContentQueryResults: Array<RelatedFactPage> = (
        relatedContentQueryResults.hits as unknown as Array<RelatedFactPage>
      )
        .sort((a, b) => {
          if (contentListId.indexOf(a._id) > contentListId.indexOf(b._id)) return 1
          else if (contentListId.indexOf(a._id) === contentListId.indexOf(b._id)) return 0
          else return -1
        })
        .slice(start, start + count)

      sortedRelatedContentQueryResults.forEach((relatedFactPage) =>
        relatedFactPages.push(parseRelatedContent(relatedFactPage))
      )
      total = relatedContentQueryResults.total
    }
  }
  return {
    relatedFactPages,
    total,
  }
}

function parseRelatedContent(relatedContent: RelatedFactPage): RelatedFactPageContent {
  let imageId: string | undefined
  let image: string | undefined
  let imageAlt = ' '
  if (relatedContent.x['com-enonic-app-metafields']?.['meta-data']?.seoImage) {
    imageId = relatedContent.x['com-enonic-app-metafields']?.['meta-data']?.seoImage
    imageAlt = getImageAlt(imageId) ?? ''
    image = imageUrl({
      id: imageId,
      scale: 'block(380, 400)',
      format: 'jpg',
    })
  } else {
    image = imagePlaceholder({
      width: 380,
      height: 400,
    })
  }

  return {
    link: pageUrl({
      id: relatedContent._id,
    }),
    image,
    imageAlt,
    title: relatedContent.displayName,
  }
}

interface RelatedFactPageContent {
  link: string
  image: string
  imageAlt: string
  title: string
}

interface RelatedFactPageProps {
  firstRelatedContents: RelatedFactPages
  relatedFactPageServiceUrl: string
  partConfig: RelatedFactPageConfig | undefined
  mainTitle: string
  showAll: string
  showLess: string
  factpagePluralName: string
  showingPhrase: string
}

type RelatedFactPage = Content<ContentList | Article>

export interface RelatedFactPages {
  relatedFactPages: Array<RelatedFactPageContent>
  total: number
}

export interface RelatedFactPageConfig {
  inputType?: string
  contentIdList?: string | Array<string>
}
