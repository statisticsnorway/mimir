const {
  getContent, pageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
  municipalsWithCounties, getMunicipality
} = __non_webpack_require__( '/lib/klass/municipalities')
const {
  pageMode
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./menuDropdown.html')

exports.get = (req) => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError('Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  // Caching this since it is a bit heavy
  const parsedMunicipalities = municipalsWithCounties()

  const page = getContent()
  const baseUrl = pageUrl({
    id: page._id
  })

  const searchBarText = i18nLib.localize({
    key: 'menuDropdown.searchBarText'
  })

  // Input field react object for sticky menu
  const inputStickyMenu = new React4xp('Input')
    .setProps({
      id: 'input-query-municipality',
      ariaLabel: searchBarText,
      searchField: true,
      placeholder: searchBarText
    })
    .setId('inputStickyMenu')

  const model = {
    mode: pageMode(req, page),
    displayName: page.displayName,
    baseUrl,
    municipality: getMunicipality(req),
    municipalities: parsedMunicipalities
  }

  const body = inputStickyMenu.renderBody({
    body: render(view, model)
  })

  return {
    body,
    contentType: 'text/html'
  }
}
