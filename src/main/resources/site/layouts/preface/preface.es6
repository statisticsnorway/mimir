import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'

import * as municipals from '/lib/municipals'

exports.get = function(req) {
  const page = portal.getContent()
  const component = portal.getComponent()
  const view = resolve('preface.html')
  const mode = municipals.mode(req, page)

  const model = { config: component.config, mainRegion: component.regions.main, mode }
  const body = thymeleaf.render(view, model)

  return { body }
}
