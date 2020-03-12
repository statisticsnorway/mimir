const { getComponent, imageUrl, pageUrl } = __non_webpack_require__( '/lib/xp/portal')
const { renderError } = __non_webpack_require__('/lib/error/error')
const { render } = __non_webpack_require__('/lib/thymeleaf')

const content = __non_webpack_require__( '/lib/xp/content')
const util = __non_webpack_require__( '/lib/util')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')

const view = resolve('./relatedFactPage.html')

exports.get = function(req, portal) {
  try {
    const part = getComponent()
    return renderPart(req, part.config.itemList)
  } catch (e) {
   return renderError(req, 'd e no fejil i parten sjø', e)
  }
}

exports.preview = (req, id) => renderPart(req, id)

function renderPart(req, relatedId) {
  if (!relatedId) {
    if (req.mode === 'edit') {
      return {
        body: render(view)
      }
    } else {
      throw new Error('Mangler innhold')
    }
  }

  const part = getComponent()
  const relatedContent = content.get({
        key: relatedId
  })
  const showAll = i18nLib.localize({
    key: 'showAll'
  })
  const relatedContentList = relatedContent.data.contentList
  const relatedContentIds = relatedContentList ? util.data.forceArray(relatedContentList) : []
  const mainTitle = part.config.title
  const relatedContentLists = []


  if (relatedContent) {
    relatedContentIds.map((key) => {
      const relatedRelatedContent = content.get({
        key
      })

      if (relatedRelatedContent) {
        const items = relatedRelatedContent.data.items ? util.data.forceArray(relatedRelatedContent.data.items) : []
        relatedContentLists.push({
          link: pageUrl ({ id: relatedRelatedContent._id }),
          image: imageUrl ({ id: relatedRelatedContent.x['com-enonic-app-metafields']['meta-data'].seoImage, scale: 'block(380, 400)' }),
          type: part.config.type,
          title: relatedRelatedContent.displayName,
          items
        })
      }
    })
  }

  if ( relatedContentLists.length === 0 ) {
    relatedContentLists.push({
      link: 'www.ssb.no',
      image: 'Feil i lasting av innhold, innhold mangler eller kunne ikke hentes.',
      type: 'Sett inn innhold!',
      title: 'sett inn innhold',
      items: []
    })
  }

  const props = {
    relatedContentLists: relatedContentLists,
    mainTitle: mainTitle,
    showAll: showAll
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

