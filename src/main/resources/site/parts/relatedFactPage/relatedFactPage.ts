import { Content } from 'enonic-types/content'
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
  getComponent, getContent, imageUrl, pageUrl
} = __non_webpack_require__('/lib/xp/portal')
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
const content = __non_webpack_require__('/lib/xp/content')
const util = __non_webpack_require__('/lib/util')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const view: ResourceKey = resolve('./relatedFactPage.html')

exports.get = function(req: Request): Response {
  try {
    const page: Content<Article> = getContent()
    const config: RelatedFactPagePartConfig = getComponent().config
    let itemList: Array<string> = []
    if (config.itemList) {
      itemList = itemList.concat(util.data.forceArray(config.itemList))
    }
    if (config.relatedFactPages) {
      itemList = itemList.concat(util.data.forceArray(config.relatedFactPages))
    }
    if (page.data.relatedFactPages) {
      itemList = itemList.concat(util.data.forceArray(page.data.relatedFactPages))
    }
    return renderPart(req, itemList)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request, id: Array<string> | string): Response => renderPart(req, [id] as Array<string>)

function renderPart(req: Request, itemList: Array<string>): Response {
  const page: Content<Article> = getContent()
  const phrases: Phrases = getPhrases(page)
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
  let relatedContents: Array<unknown> = []

  itemList.map((key: string) => {
    const relatedPage: unknown = fromRelatedFactPageCache(req, key, () => {
      const relatedContent: Content<ContentList, object, SEO> | null = content ? content.get({
        key
      }) : null

      if (relatedContent) {
        if (relatedContent.type === `${app.name}:contentList` && relatedContent.data.contentList) {
          // handles content list for part-config
          const contentList: Array<string> = util.data.forceArray(relatedContent.data.contentList)
          return contentList.map((c: string) => {
            const contentListItem: Content<Article, object, SEO> | null = content ? content.get({
              key: c
            }) : null
            return contentListItem ? parseRelatedContent(contentListItem) : null
          })
        } else { // handles content selector from content-types (articles, statistics etc)
        // handles content selector from content-types (articles, statistics etc)
          return parseRelatedContent(relatedContent)
        }
      }
      return
    })

    if (Array.isArray(relatedPage)) { // might get an array from contentList
      relatedContents = relatedContents.concat(relatedPage)
    } else {
      relatedContents.push(relatedPage)
    }
  })
  relatedContents = relatedContents.filter((r) => !!r)

  if (relatedContents.length === 0) {
    if (req.mode === 'edit') {
      return {
        body: render(view)
      }
    } else {
      return {
        body: null
      }
    }
  }

  const props: RelatedFactPageProps = {
    relatedContents,
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

function parseRelatedContent(relatedContent: Content<ContentList, object, SEO> | Content<Article, object, SEO>): RelatedFactPageContent {
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
  relatedContents: Array<unknown>;
  mainTitle:string;
  showAll: string;
  showLess: string;
}
