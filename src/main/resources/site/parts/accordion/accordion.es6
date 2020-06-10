const {
  getComponent,
  processHtml
} = __non_webpack_require__( '/lib/xp/portal')
const {sanitize} = __non_webpack_require__( '/lib/xp/common')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const content = __non_webpack_require__( '/lib/xp/content')
const util = __non_webpack_require__( '/lib/util')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = function(req) {
  try {
    const part = getComponent()
    const accordionIds = part.config.accordion ? util.data.forceArray(part.config.accordion) : []
    return renderPart(req, accordionIds)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, accordionIds) {
  const accordions = []

  accordionIds.map((key) => {
    const accordion = content.get({
      key
    })

    if (accordion) {
      const accordionContents = accordion.data.accordions ? util.data.forceArray(accordion.data.accordions) : []
      accordionContents.forEach((accordion) => {
        const items = accordion.items ? util.data.forceArray(accordion.items) : []
        accordions.push({
          id: sanitize(accordion.open),
          body: processHtml({
            value: accordion.body
          }),
          open: accordion.open,
          items
        })
      })
    }
  })

  if ( accordions.length === 0 ) {
    accordions.push({
      body: 'Feil i lasting av innhold, innhold mangler eller kunne ikke hentes.',
      open: 'Sett inn innhold!',
      items: []
    })
  }

  const props = {
    accordions: accordions
  }

  return React4xp.render('site/parts/accordion/accordion', props, req)
}
