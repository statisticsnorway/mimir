const { getComponent, imageUrl, pageUrl, processHtml } = __non_webpack_require__( '/lib/xp/portal')
const { renderError } = __non_webpack_require__('/lib/error/error')

const content = __non_webpack_require__( '/lib/xp/content')
const util = __non_webpack_require__( '/lib/util')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'd e no fejil i parten sjø', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const part = getComponent()
  const relatedContent = content.get({
        key: part.config.itemList
  })
  const relatedContentList = relatedContent.data.contentList
  const relatedContentIds = relatedContentList ? util.data.forceArray(relatedContentList) : []

  const relatedContentLists = []

  relatedContentIds.map((key) => {
    const relatedRelatedContent = content.get({
      key
    })

    if (relatedRelatedContent) {
      const items = relatedRelatedContent.data.items ? util.data.forceArray(relatedRelatedContent.data.items) : []
      relatedContentLists.push({
        link: pageUrl ({ id: relatedRelatedContent._id }),
        image: imageUrl ({ id: relatedRelatedContent.x['com-enonic-app-metafields']['meta-data'].seoImage, scale: 'block(380, 400)' }),
        type: relatedRelatedContent.x['com-enonic-app-metafields']['meta-data'].seoTitle,
        title: relatedRelatedContent.displayName,
        items
      })
    }
  })

  const props = {
    relatedContentLists: relatedContentLists
  }

  return React4xp.render(part, props, req)
}

