import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'
import { getMunicipality } from '/lib/klass/municipalities'
import { pageMode } from '/lib/ssb/utils'

const view = resolve('./banner.html')

exports.get = function(req) {
  const page = portal.getContent()
  const part = portal.getComponent()
  const municipality = getMunicipality(req)
  const mode = pageMode(req, page)
  const model = { page, part, municipality, mode }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
