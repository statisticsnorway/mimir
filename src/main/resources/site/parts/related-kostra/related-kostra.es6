import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'
import * as municipals from '/lib/municipals'

import * as klass from '/lib/klass'

const view = resolve('./banner.html')

exports.get = function(req) {
  const page = portal.getContent()
  const part = portal.getComponent()
  const municipality = klass.getMunicipality(req)
  const mode = municipals.mode(req, page)
  const model = { page, part, municipality, mode }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
