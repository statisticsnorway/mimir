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

const view = resolve('./menu-dropdown.html')

exports.get = (req) => renderPart(req)

exports.preview = (req, id) => renderPart(req)

function renderPart(req) {
  // Caching this since it is a bit heavy
  const parsedMunicipalities = municipalsWithCounties()

  const page = getContent()
  const baseUrl = pageUrl({
    id: page._id
  })
  const model = {
    mode: pageMode(req, page),
    displayName: page.displayName,
    baseUrl,
    municipality: getMunicipality(req),
    municipalities: parsedMunicipalities
  }

  return {
    body: render(view, model),
    contentType: 'text/html'
  }
}
