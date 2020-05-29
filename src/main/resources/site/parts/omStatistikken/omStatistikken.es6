const {
  getContent
} = __non_webpack_require__( '/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const view = resolve('./omStatistikken.html')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req) {
  return renderPart(req)
}

function renderPart(req) {
  const page = getContent()

  const definition = {
    body: '',
    open: i18nLib.localize({
      key: 'definitions'
    }),
    items: getOmStatistikkenItems(page.data.definition)
  }

  const administrativeInformation = {
    body: '',
    open: i18nLib.localize({
      key: 'administrativeInformation'
    }),
    items: getOmStatistikkenItems(page.data.administrativeInformation)
  }

  const background = {
    body: '',
    open: i18nLib.localize({
      key: 'background'
    }),
    items: getOmStatistikkenItems(page.data.background)
  }


  const accordions = []
  accordions.push(definition)
  accordions.push(administrativeInformation)
  accordions.push(background)

  if (accordions.length === 0) {
    accordions.push({
      body: 'Feil i lasting av innhold, innhold mangler eller kunne ikke hentes.',
      open: 'Sett inn innhold!',
      items: []
    })
  }

  const props = {
    accordions: accordions
  }
  const omStatistikken = new React4xp('site/parts/accordion/accordion').setProps(props).setId('omStatistikken')
    .uniqueId()
  const body = render(view, {
    omStatistikkenId: omStatistikken.react4xpId
  })
  return {
    body: omStatistikken.renderBody({
      body: body
    }),
    pageContributions: omStatistikken.renderPageContributions()
  }

  function getOmStatistikkenItems(category) {
    const items = []
    if (category) {
      Object.keys(category).forEach((key) => {
        const item = {
          title: i18nLib.localize({
            key: key
          }),
          body: category[key] ? category[key] : 'Ikke relevant'
        }
        items.push(item)
      })
    }
    return items
  }
}
