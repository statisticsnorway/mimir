const {
  getContent
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
const {
  renderError
} = __non_webpack_require__( '/lib/error/error')

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

  // Input field react object for sticky menu
  const inputStickyMenu = new React4xp('Input')
    .setProps({
      inputId: 'input-query-municipality',
      htmlFor: inputId,
      inputLabel: (pageMode(req, page) == 'municipality') ? 'Bytt kommune: ' : '',
      ariaLabel: 'Søk på kommune',
      searchField: true,
      placeholder: 'Søk på kommune',
      chooseMap: 'Velg i kart'
    })
    .setId('inputStickyMenu')
    .uniqueId()

  const model = {
    inputStickMenuId: inputStickyMenu.react4xpId,
    mode: pageMode(req, page),
    page: {
      displayName: page.displayName,
      _id: page._id
    },
    municipality: getMunicipality(req),
    municipalities: parsedMunicipalities
  }

  const preRenderedBody = render(view, model)

  const preExistingPageContributions = {
    bodyEnd: `<script>
        console.log('Rendered object: ${inputStickyMenu.props.inputId}')
            </script>`
  }

  return {
    body: inputStickyMenu.renderBody({
      body: preRenderedBody
    }),
    contentType: 'text/html',
    pageContributions: (req.mode === 'live' || req.mode === 'preview') ?
      inputStickyMenu.renderPageContributions({
          pageContributions: preExistingPageContributions
        }) :
      undefined
  }
}
