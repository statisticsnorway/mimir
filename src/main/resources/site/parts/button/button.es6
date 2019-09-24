import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

exports.get = function(req) {
  const part = portal.getComponent() || req
  const view = resolve('./button.html')
  const buttons = []

  part.config.button = part.config.button && util.data.forceArray(part.config.button) || []
  part.config.button.map((key) => {
     const button = content.get({ key })
     buttons.push(button)
  })

  const model = { part, buttons }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
