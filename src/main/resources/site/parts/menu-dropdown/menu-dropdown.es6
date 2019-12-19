import { getContent } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { municipalsWithCounties, getMunicipality } from '/lib/klass/municipalities'
import { pageMode } from '/lib/ssb/utils'

const view = resolve('./menu-dropdown.html')

exports.get = (req) => renderPart(req)

exports.preview = (req, id) => renderPart(req)

function renderPart(req) {
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
