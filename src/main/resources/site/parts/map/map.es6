import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

exports.get = function(req) {
  const part = portal.getComponent() || req
  const view = resolve('./map.html')
  const maps = []

  part.config.map = part.config.map && util.data.forceArray(part.config.map) || []
  part.config.map.map((key) => {
     const map = content.get({ key })
     maps.push(map)
  })

  const model = { part, maps }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
