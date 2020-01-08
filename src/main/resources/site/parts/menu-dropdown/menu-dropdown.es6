const { getContent } = __non_webpack_require__( '/lib/xp/portal')
const { render } = __non_webpack_require__( '/lib/thymeleaf')
const { municipalsWithCounties, getMunicipality } = __non_webpack_require__( '/lib/klass/municipalities')
const { pageMode } = __non_webpack_require__( '/lib/ssb/utils')

const view = resolve('./menu-dropdown.html')

exports.get = (req) => renderPart(req)

exports.preview = (req, id) => renderPart(req)

function renderPart (req) {
  // Caching this since it is a bit heavy
  const parsedMunicipalities = municipalsWithCounties()

  const page = getContent()
  const model = {
    mode: pageMode(req, page),
    page: {
      displayName: page.displayName,
      _id: page._id
    },
    municipality: getMunicipality(req),
    municipalities: parsedMunicipalities
  }

  return { body: render(view, model), contentType: 'text/html' }
}
