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
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const view = resolve('./relatedFactPage.html')

exports.get = function(req, portal) {
  try {
    const page = getContent()
    const part = getComponent()
    let itemList = []
    if (part.config.itemList) {
      itemList = itemList.concat(util.data.forceArray(part.config.itemList))
    }
    if (part.config.relatedFactPages) {
      itemList = itemList.concat(util.data.forceArray(part.config.relatedFactPages))
    }
    if (page.data.relatedFactPages) {
      itemList = itemList.concat(util.data.forceArray(page.data.relatedFactPages))
    } else if (page.data.relatedFactPagesItemSet && page.data.relatedFactPagesItemSet.itemList) { // fallback to old, delete in a while
      itemList = itemList.concat(util.data.forceArray(page.data.relatedFactPagesItemSet.itemList))
    }

    return renderPart(req, itemList)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, itemList) {
  const page = getContent()
  const phrases = getPhrases(page)
  const part = getComponent()
  const mainTitle = part && part.config && part.config.title ? part.config.title : phrases.relatedFactPagesHeading

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

  const type = part && part.config && part.config.type ? part.config.type : undefined
  const showAll = phrases.showAll
  const showLess = phrases.showLess
  let relatedContents = []

  itemList.forEach((key) => {
    const relatedPage = fromRelatedFactPageCache(req, key, () => {
      const relatedContent = content.get({
        key
      })

      if (relatedContent) {
        if (relatedContent.type === `${app.name}:contentList` && relatedContent.data.contentList) {
          // handles content list for part-config
          const contentList = util.data.forceArray(relatedContent.data.contentList)
          return contentList.map((c) => {
            const contentListItem = content.get({
              key: c
            })
            return contentListItem ? parseRelatedContent(contentListItem, type) : null
          })
        } else { // handles content selector from content-types (articles, statistics etc)
        // handles content selector from content-types (articles, statistics etc)
          return parseRelatedContent(relatedContent, type)
        }
      }
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

  const props = {
    relatedContents,
    mainTitle,
    showAll,
    showLess
  }

  const relatedFactPage = new React4xp('site/parts/relatedFactPage/relatedFactPage')
    .setProps(props)
    .setId('relatedFactPage')
    .uniqueId()

  const body = render(view, {
    relatedId: relatedFactPage.react4xpId
  })

  return {
    body: relatedFactPage.renderBody({
      body,
      clientRender: req.mode !== 'edit'
    }),
    pageContributions: relatedFactPage.renderPageContributions({
      clientRender: req.mode !== 'edit'
    })
  }
}

const parseRelatedContent = (relatedContent, type) => {
  let imageId
  if (relatedContent.x &&
    relatedContent.x['com-enonic-app-metafields'] &&
    relatedContent.x['com-enonic-app-metafields']['meta-data'] &&
    relatedContent.x['com-enonic-app-metafields']['meta-data'].seoImage) {
    imageId = relatedContent.x['com-enonic-app-metafields']['meta-data'].seoImage
  }
  let image
  let imageAlt = ' '
  if (imageId) {
    image = imageUrl({
      id: imageId,
      scale: 'block(380, 400)'
    })
    imageAlt = getImageAlt(imageId) ? getImageAlt(imageId) : ' '
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
    type,
    title: relatedContent.displayName
  }
}
