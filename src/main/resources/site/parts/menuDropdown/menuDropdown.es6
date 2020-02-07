const {
  getContent, pageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  municipalsWithCounties, getMunicipality
} = __non_webpack_require__( '/lib/klass/municipalities')
const {
  pageMode
} = __non_webpack_require__( '/lib/ssb/utils')

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

  // Input field react object for sticky menu
  const inputStickyMenu = new React4xp('Input')
    .setProps({
      id: 'input-query-municipality',
      ariaLabel: 'Søk på kommune', /* TODO: legg til i phrases og hent det derfra istedet */
      searchField: true,
      placeholder: 'Søk på kommune'
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
