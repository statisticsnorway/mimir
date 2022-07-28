import { get, query, Content, QueryResponse } from '/lib/xp/content'
import { Phrases } from '../../../lib/types/language'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { SEO } from '../../../services/news/news'
import { Article } from '../../content-types/article/article'
import { ContentList } from '../../content-types/contentList/contentList'
import { RelatedFactPagePartConfig } from './relatedFactPage-part-config'

const {
  imagePlaceholder,
  getComponent, getContent, imageUrl, pageUrl, serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  getImageAlt
} = __non_webpack_require__('/lib/ssb/utils/imageUtils')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')
const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = function(req: XP.Request): XP.Response | React4xpResponse {
  try {
    const page: Content<Article> = getContent()
    const config: RelatedFactPagePartConfig = getComponent().config
    let relatedFactPageConfig: RelatedFactPageConfig | undefined
    if (config.itemList) {
      relatedFactPageConfig = {
        inputType: 'itemList',
        contentIdList: config.itemList
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
        contentIdList
      }
    }
    return renderPart(req, relatedFactPageConfig)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request, relatedFactPageConfig: RelatedFactPageConfig | undefined): XP.Response | React4xpResponse =>
  renderPart(req, relatedFactPageConfig)

function renderPart(req: XP.Request, relatedFactPageConfig: RelatedFactPageConfig | undefined): XP.Response | React4xpResponse {
  const page: Content<Article> = getContent()
  if (req.mode === 'edit' || req.mode === 'inline') {
    return renderRelatedFactPage(req, page, relatedFactPageConfig)
  } else {
    return fromPartCache(req, `${page._id}-relatedFactPage`, () => {
      return renderRelatedFactPage(req, page, relatedFactPageConfig)
    })
  }
}

function renderRelatedFactPage(req: XP.Request, page: Content, relatedFactPageConfig: RelatedFactPageConfig | undefined): XP.Response | React4xpResponse {
  const phrases: Phrases = getPhrases(page)
  const config: RelatedFactPagePartConfig = getComponent().config
  const mainTitle: string = config.title ? config.title : phrases.relatedFactPagesHeading
  const showAll: string = phrases.showAll
  const showLess: string = phrases.showLess

  const firstRelatedContents: RelatedFactPages = parseRelatedFactPageData(relatedFactPageConfig, 0, 4)

  const relatedFactPageServiceUrl: string = serviceUrl({
    service: 'relatedFactPage'
  })

  const props: RelatedFactPageProps = {
    firstRelatedContents,
    relatedFactPageServiceUrl,
    partConfig: relatedFactPageConfig,
    mainTitle,
    showAll,
    showLess
  }

  if (relatedFactPageConfig) {
    return React4xp.render('site/parts/relatedFactPage/relatedFactPage', props, req, {
      body: `<section class="xp-part part-picture-card"></section>`
    })
  } else {
    // Render title only on page templates in edit mode
    if (req.mode === 'edit' && page.type !== `${app.name}:article` && page.type !== `${app.name}:statistics`) {
      return React4xp.render('site/parts/relatedFactPage/relatedFactPage', {
        mainTitle
      }, req, {
        body: `<section class="xp-part part-picture-card"></section>`
      })
    } else {
      return {
        body: null
      }
    }
  }
}

export function parseRelatedFactPageData(relatedFactPageConfig: RelatedFactPageConfig | undefined, start: number, count: number): RelatedFactPages {
  const relatedFactPages: Array<RelatedFactPageContent> = []
  let total: number = 0
  if (relatedFactPageConfig && relatedFactPageConfig.contentIdList) {
    let contentListId: Array<string> = relatedFactPageConfig.contentIdList as Array<string>
    if (relatedFactPageConfig.inputType === 'itemList') {
      const relatedContent: RelatedFactPage | null = get({
        key: relatedFactPageConfig.contentIdList as string
      })
      contentListId = forceArray((relatedContent?.data as ContentList).contentList) as Array<string>
    }
    const relatedContentQueryResults: QueryResponse<RelatedFactPage> | null = contentListId.length ? query({
      count: 999,
      query: `_id IN(${(contentListId).map((id) => `'${id}'`).join(',')})`
    }) : null
    if (relatedContentQueryResults) {
      const sortedRelatedContentQueryResults: Array<RelatedFactPage> =
       (relatedContentQueryResults.hits as unknown as Array<RelatedFactPage>)
         .sort((a, b) => {
           if (contentListId.indexOf(a._id) > contentListId.indexOf(b._id)) return 1
           else return -1
         })
         .slice(start, start + count)
      sortedRelatedContentQueryResults.map((relatedFactPage) => relatedFactPages.push(parseRelatedContent(relatedFactPage)))
      total = relatedContentQueryResults.total
    }
  }
  return {
    relatedFactPages,
    total
  }
}

function parseRelatedContent(relatedContent: RelatedFactPage): RelatedFactPageContent {
  let imageId: string | undefined
  if (relatedContent.x &&
    relatedContent.x['com-enonic-app-metafields'] &&
    relatedContent.x['com-enonic-app-metafields']['meta-data'] &&
    relatedContent.x['com-enonic-app-metafields']['meta-data'].seoImage) {
    imageId = relatedContent.x['com-enonic-app-metafields']['meta-data'].seoImage
  }
  let image: string | undefined
  let imageAlt: string = ' '
  if (imageId) {
    image = imageUrl({
      id: imageId,
      scale: 'block(380, 400)'
    })
    imageAlt = getImageAlt(imageId) ? getImageAlt(imageId) as string : ' '
  } else {
    image = imagePlaceholder({
      width: 380,
      height: 400
    })
  }

  return {
    link: pageUrl({
      id: relatedContent._id
    }),
    image,
    imageAlt,
    title: relatedContent.displayName
  }
}

interface RelatedFactPageContent {
  link: string;
  image: string;
  imageAlt: string;
  title: string;
}

interface RelatedFactPageProps {
  firstRelatedContents: RelatedFactPages;
  relatedFactPageServiceUrl: string;
  partConfig: RelatedFactPageConfig | undefined;
  mainTitle:string;
  showAll: string;
  showLess: string;
}

type RelatedFactPage = Content<ContentList | Article, object, SEO>

export interface RelatedFactPages {
  relatedFactPages: Array<RelatedFactPageContent>;
  total: number;
}

export interface RelatedFactPageConfig {
  inputType?: string;
  contentIdList?: string | Array<string>;
}
