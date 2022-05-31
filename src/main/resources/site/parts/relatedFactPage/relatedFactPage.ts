import { Content, QueryResponse } from 'enonic-types/content'
import { PageContributions, Request, Response } from 'enonic-types/controller'
import { ResourceKey } from 'enonic-types/thymeleaf'
import { Phrases } from '../../../lib/types/language'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'
import { SEO } from '../../../services/news/news'
import { Article } from '../../content-types/article/article'
import { ContentList } from '../../content-types/contentList/contentList'
import { RelatedFactPagePartConfig } from './relatedFactPage-part-config'

const {
  imagePlaceholder,
  getComponent, getContent, imageUrl, pageUrl, serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  query
} = __non_webpack_require__('/lib/xp/content')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
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
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const view: ResourceKey = resolve('./relatedFactPage.html')

exports.get = function(req: Request): Response {
  try {
    const page: Content<Article> = getContent()
    const config: RelatedFactPagePartConfig = getComponent().config
    let relatedFactPageConfig: RelatedFactPageConfig = {}
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
      if (page.data.relatedArticles) {
        contentIdList = forceArray(page.data.relatedFactPages) as Array<string>
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

exports.preview = (req: Request, relatedFactPageConfig: RelatedFactPageConfig): Response => renderPart(req, relatedFactPageConfig)

function renderPart(req: Request, relatedFactPageConfig: RelatedFactPageConfig): Response {
  const page: Content<Article> = getContent()
  if (req.mode === 'edit') {
    return renderRelatedFactPage(req, page, relatedFactPageConfig)
  } else {
    return fromPartCache(req, `${page._id}-relatedFactPage`, () => {
      return renderRelatedFactPage(req, page, relatedFactPageConfig)
    })
  }
}

function renderRelatedFactPage(req: Request, page: Content, relatedFactPageConfig: RelatedFactPageConfig): Response {
  const phrases: Phrases = getPhrases(page)
  const config: RelatedFactPagePartConfig = getComponent().config
  const mainTitle: string = config.title ? config.title : phrases.relatedFactPagesHeading

  // if (relatedFactPageConfig.length === 0) {
  //   if (req.mode === 'edit' && page.type !== `${app.name}:article` && page.type !== `${app.name}:statistics`) {
  //     return {
  //       body: render(view, {
  //         mainTitle
  //       })
  //     }
  //   } else {
  //     return {
  //       body: null
  //     }
  //   }
  // }

  const showAll: string = phrases.showAll
  const showLess: string = phrases.showLess

  const firstRelatedContents: RelatedFactPages = parseRelatedFactPageData(relatedFactPageConfig, 0, 4) // TODO: 3 on mobile

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

  const relatedFactPage: React4xpObject = new React4xp('site/parts/relatedFactPage/relatedFactPage')
    .setProps(props)
    .setId('relatedFactPage')
    .uniqueId()

  const body: string = render(view, {
    relatedId: relatedFactPage.react4xpId
  })

  return {
    body: relatedFactPage.renderBody({
      body,
      clientRender: req.mode !== 'edit'
    }),
    pageContributions: relatedFactPage.renderPageContributions({
      clientRender: req.mode !== 'edit'
    }) as PageContributions
  }
}

export function parseRelatedFactPageData(relatedFactPageConfig: RelatedFactPageConfig, start: number, count: number): RelatedFactPages {
  const relatedFactPages: Array<RelatedFactPageContent> = []
  let total: number = 0
  if (relatedFactPageConfig.contentIdList) {
    let contentListId: Array<string> = relatedFactPageConfig.contentIdList as Array<string>
    if (relatedFactPageConfig.inputType === 'itemList') {
      const relatedContent: RelatedFactPage | null = get({
        key: relatedFactPageConfig.contentIdList as string
      })

      contentListId = forceArray((relatedContent?.data as ContentList).contentList) as Array<string>
    }
    const relatedContentQueryResults: QueryResponse<RelatedFactPage> | null = contentListId.length ? query({
      start,
      count,
      query: `_id IN(${(contentListId).map((id) => `'${id}'`).join(',')})`
    }) : null

    if (relatedContentQueryResults) {
      total = relatedContentQueryResults.total
      relatedContentQueryResults.hits.map((relatedContent) => relatedFactPages.push(parseRelatedContent(relatedContent as RelatedFactPage)))
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
  partConfig: RelatedFactPageConfig;
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
