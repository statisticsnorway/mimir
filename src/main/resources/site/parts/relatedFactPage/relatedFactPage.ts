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
  fromRelatedFactPageCache
} = __non_webpack_require__('/lib/ssb/cache/cache')
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
    let contentIdList: Array<string> = []
    if (config.itemList) {
      contentIdList = contentIdList.concat(forceArray(config.itemList))
    }
    if (config.relatedFactPages) {
      contentIdList = contentIdList.concat(forceArray(config.relatedFactPages))
    }
    if (page.data.relatedFactPages) {
      contentIdList = contentIdList.concat(forceArray(page.data.relatedFactPages))
    }
    return renderPart(req, contentIdList)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request, id: Array<string> | string): Response => renderPart(req, [id] as Array<string>)

function renderPart(req: Request, itemList: Array<string>): Response {
  const page: Content<Article> = getContent()
  const phrases: Phrases = getPhrases(page)
  const language: string = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  const config: RelatedFactPagePartConfig = getComponent().config
  const mainTitle: string = config.title ? config.title : phrases.relatedFactPagesHeading

  if (itemList.length === 0) {
    if (req.mode === 'edit' && page.type !== `${app.name}:article` && page.type !== `${app.name}:statistics`) {
      return {
        body: render(view, {
          mainTitle
        })
      }
    } else {
      return {
        body: null
      }
    }
  }

  const showAll: string = phrases.showAll
  const showLess: string = phrases.showLess

  // if (relatedContents.length === 0) {
  //   if (req.mode === 'edit') {
  //     return {
  //       body: render(view)
  //     }
  //   } else {
  //     return {
  //       body: null
  //     }
  //   }
  // }

  const firstRelatedContents: RelatedFactPages = parseRelatedFactPageData(itemList, 0, 4, language)

  const relatedFactPageServiceUrl: string = serviceUrl({
    service: 'relatedFactPage'
  })

  const props: RelatedFactPageProps = {
    firstRelatedContents,
    relatedFactPageServiceUrl,
    partConfig: itemList,
    language,
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

export function parseRelatedFactPageData(itemList: Array<string>, start: number, count: number, language: string): RelatedFactPages {
  const relatedContents: Array<RelatedFactPageContent> = []

  // itemList.map((key: string) => {
  //   const relatedPage: unknown = fromRelatedFactPageCache(req, key, () => {
  //     const relatedContent: RelatedFactPage | null = content ? content.get({
  //       key
  //     }) : null


  //     if (relatedContent) {
  //       if (relatedContent.type === `${app.name}:contentList` && relatedContent.data.contentList) {
  //         // handles content list for part-config
  //         const contentList: Array<string> = util.data.forceArray(relatedContent.data.contentList)
  //         return contentList.map((c: string) => {
  //           const contentListItem: Content<Article, object, SEO> | null = content ? content.get({
  //             key: c
  //           }) : null
  //           return contentListItem ? parseRelatedContent(contentListItem) : null
  //         })
  //       } else { // handles content selector from content-types (articles, statistics etc)
  //       // handles content selector from content-types (articles, statistics etc)
  //         return parseRelatedContent(relatedContent)
  //       }
  //     }
  //     return
  //   })

  //   if (Array.isArray(relatedPage)) { // might get an array from contentList
  //     relatedContents = relatedContents.concat(relatedPage)
  //   } else {
  //     relatedContents.push(relatedPage)
  //   }
  // })
  // relatedContents = relatedContents.filter((r) => !!r)

  const relatedContentList: QueryResponse<RelatedFactPage> | null = itemList.length ? query({
    start,
    count,
    query: `_id IN(${itemList.map((id) => `'${id}'`).join(',')})`
  }) : null
  log.info(JSON.stringify(itemList.map((id) => `'${id}'`).join(','), null, 2))

  relatedContentList?.hits.map((relatedContent) => {
    if (relatedContent) {
      if (relatedContent.type === `${app.name}:contentList` && (relatedContent.data as ContentList).contentList) {
        // handles content list for part-config
        const contentList: Array<string> = forceArray((relatedContent.data as ContentList).contentList) as Array<string>
        log.info(JSON.stringify(contentList, null, 2))
        const relatedContentList: Array<RelatedFactPage> | null = contentList.length ? query({
          start,
          count,
          query: `_id IN(${contentList.map((id) => `'${id}'`).join(',')})`
        }).hits as unknown as Array<RelatedFactPage> : null

        if (relatedContentList) {
          relatedContentList.map((relatedContent) => relatedContents.push(parseRelatedContent(relatedContent)))
        }
      } else { // handles content selector from content-types (articles, statistics etc)
        // handles content selector from content-types (articles, statistics etc)
        relatedContents.push(parseRelatedContent(relatedContent as RelatedFactPage))
      }
    }
    return
  })

  log.info(JSON.stringify(relatedContentList, null, 2))
  log.info(JSON.stringify(relatedContents, null, 2))

  return {
    relatedContents: relatedContents,
    total: relatedContentList ? relatedContentList.total : 0
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
  partConfig: Array<string>,
  language: string,
  mainTitle:string;
  showAll: string;
  showLess: string;
}

type RelatedFactPage = Content<ContentList | Article, object, SEO>

export interface RelatedFactPages {
  relatedContents: Array<RelatedFactPageContent>;
  total: number;
}

