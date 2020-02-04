const {
  getContent
} = __non_webpack_require__( '/lib/xp/portal')
const {
  municipalsWithCounties,
  getMunicipality
} = __non_webpack_require__( '/lib/klass/municipalities')
const {
  pageMode
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  renderError
} = __non_webpack_require__( '/lib/error/error')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
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

  // Input field react object for sticky menu
  const inputStickyMenu = new React4xp('Input')
    .setProps({
      id: 'input-query-municipality',
      ariaLabel: 'Søk på kommune',
      searchField: true,
      placeholder: 'Søk på kommune'
    })
    .setId('inputStickyMenu')

  const model = {
    mode: pageMode(req, page),
    page: {
      displayName: page.displayName,
      _id: page._id
    },
    municipality: getMunicipality(req),
    municipalities: parsedMunicipalities
  }

  const body = inputStickyMenu.renderBody({
    body: thymeleaf.render(view, model)
  })

  return {
    body,
    contentType: 'text/html'
  }
}
