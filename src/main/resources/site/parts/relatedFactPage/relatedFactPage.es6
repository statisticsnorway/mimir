const {
  imagePlaceholder,
  getComponent, getContent, imageUrl, pageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  getPhrases
} = __non_webpack_require__( '/lib/language')
const {
  getImageCaption
} = __non_webpack_require__('/lib/ssb/utils')
const content = __non_webpack_require__( '/lib/xp/content')
const util = __non_webpack_require__( '/lib/util')
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
    if (page.data.relatedFactPagesItemSet && page.data.relatedFactPagesItemSet.itemList) {
      itemList = itemList.concat(util.data.forceArray(page.data.relatedFactPagesItemSet.itemList))
    }

    return renderPart(req, itemList)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req, id) => renderPart(req, id)

function renderPart(req, itemList) {
  if (itemList.length === 0) {
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

  const page = getContent()
  const part = getComponent()
  const phrases = getPhrases(page)

  const showAll = phrases.showAll
  const showLess = phrases.showLess
  const mainTitle = part.config.title || phrases.relatedFactPagesHeading
  const relatedContentLists = []

  itemList.forEach((key) => {
    const relatedContent = content.get({
      key
    })

    if (relatedContent) {
      if (relatedContent.type === `${app.name}:contentList` && relatedContent.data.contentList) {
        // handles content list for part-config
        const contentList = util.data.forceArray(relatedContent.data.contentList)
        contentList.forEach((c) => {
          const contentListItem = content.get({
            key: c
          })
          if (contentListItem) {
            relatedContentLists.push(parseRelatedContent(contentListItem))
          }
        })
      } else { // handles content selector from content-types (articles, statistics etc)
        relatedContentLists.push(parseRelatedContent(relatedContent))
      }
    }
  })

  if (relatedContentLists.length === 0) {
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
    relatedContentLists,
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
      body
    }),
    pageContributions: relatedFactPage.renderPageContributions()
  }
}

const parseRelatedContent = (relatedContent) => {
  const part = getComponent()

  let imageId
  if (relatedContent.x &&
    relatedContent.x['com-enonic-app-metafields'] &&
    relatedContent.x['com-enonic-app-metafields']['meta-data'] &&
    relatedContent.x['com-enonic-app-metafields']['meta-data'].seoImage) {
    imageId = relatedContent.x['com-enonic-app-metafields']['meta-data'].seoImage
  }
  let image
  let imageAlt = ''
  if (imageId) {
    image = imageUrl({
      id: imageId,
      scale: 'block(380, 400)'
    })
    imageAlt = getImageCaption(imageId)
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
    type: part.config.type || undefined,
    title: relatedContent.displayName
  }
}
