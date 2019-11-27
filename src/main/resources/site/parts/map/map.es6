import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'
import * as municipals from '/lib/municipals'

exports.get = function(req) {
  const page = portal.getContent()
  const part = portal.getComponent() || req
  const view = resolve('./map.html')
  part.config.map = part.config.map && util.data.forceArray(part.config.map) || []
  const maps = part.config.map.map((key) => (key) => content.get({ key }))
  const mode = municipals.mode(req, page)
  const model = { part, maps, mode }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
