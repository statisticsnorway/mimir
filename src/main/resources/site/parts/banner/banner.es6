import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'

import * as klass from '/lib/klass'

exports.get = function(req) {
  const page = portal.getContent()
  const part = portal.getComponent()
  const view = resolve('./banner.html')
  const municipality = klass.getMunicipality(req)
  const mode = req.mode === 'edit' && 'edit' || page._path.endsWith(req.path.split('/').pop()) ? 'map' : 'municipality'
  const model = { page, part, municipality, mode }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
