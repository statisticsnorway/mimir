import { get as getContentByKey, query, type Content, type QueryResponse } from '/lib/xp/content'
import type { Phrases } from '../../../lib/types/language'
import { render, type RenderResponse } from '/lib/enonic/react4xp'
import type { SEO } from '../../../services/news/news'
import type { Article, ContentList } from '../../content-types'
import type { RelatedFactPage as RelatedFactPagePartConfig } from '.'
import { imagePlaceholder, getComponent, getContent, imageUrl, pageUrl, serviceUrl } from '/lib/xp/portal'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')
const { getImageAlt } = __non_webpack_require__('/lib/ssb/utils/imageUtils')
const { fromPartCache } = __non_webpack_require__('/lib/ssb/cache/partCache')
const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')

export function get(req: XP.Request): XP.Response | RenderResponse {
  try {
    const page: Content<Article> = getContent()
    const config: RelatedFactPagePartConfig = getComponent().config
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

export function preview(
  req: XP.Request,
  relatedFactPageConfig: RelatedFactPageConfig | undefined
): XP.Response | RenderResponse {
  return renderPart(req, relatedFactPageConfig)
}

function renderPart(
  req: XP.Request,
  relatedFactPageConfig: RelatedFactPageConfig | undefined
): XP.Response | RenderResponse {
  const page: Content<Article> = getContent()
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
): XP.Response | RenderResponse {
  const phrases: Phrases = getPhrases(page)
  const config: RelatedFactPagePartConfig = getComponent().config
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
  if (relatedFactPageConfig && relatedFactPageConfig.contentIdList) {
    let contentListId: Array<string> = relatedFactPageConfig.contentIdList as Array<string>

    // why this? if contentListId is empty [], then:
    if (relatedFactPageConfig.inputType === 'itemList') {
      const relatedContent: RelatedFactPage | null = getContentByKey({
        key: relatedFactPageConfig.contentIdList as string,
      })
      contentListId = forceArray((relatedContent?.data as ContentList).contentList) as Array<string>
    }

    const relatedContentQueryResults: QueryResponse<RelatedFactPage, object> | null = contentListId.length
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
          else return -1
        })
        .slice(start, start + count)

      sortedRelatedContentQueryResults.map((relatedFactPage) =>
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
  if (relatedContent.x['com-enonic-app-metafields']['meta-data'].seoImage) {
    imageId = relatedContent.x['com-enonic-app-metafields']['meta-data'].seoImage
    imageAlt = getImageAlt(imageId) ? (getImageAlt(imageId) as string) : ' '
    image = imageUrl({
      id: imageId,
      scale: 'block(380, 400)',
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
}

type RelatedFactPage = Content<ContentList | Article, SEO>

export interface RelatedFactPages {
  relatedFactPages: Array<RelatedFactPageContent>
  total: number
}

export interface RelatedFactPageConfig {
  inputType?: string
  contentIdList?: string | Array<string>
}
