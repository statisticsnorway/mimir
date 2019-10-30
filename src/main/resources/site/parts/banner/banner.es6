import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'

exports.get = function(req) {
  // TODO: get minicipality
  // const site = content.getSite()

  const part = portal.getComponent()
  const view = resolve('./banner.html')

  const model = { part }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
