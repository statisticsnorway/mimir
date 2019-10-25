import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

exports.get = function(req) {
  // TODO: get minicipality
  // const site = content.getSite()

  const part = portal.getComponent()
  const view = resolve('./banner.html')

log.info(JSON.stringify(part, null, ' '))

  const model = { part }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
