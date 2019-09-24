import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

exports.get = function(req) {
  const part = portal.getComponent() || req
  const view = resolve('./accordion.html')
  const accordions = []

  part.config.accordion = part.config.accordion && util.data.forceArray(part.config.accordion) || []
  part.config.accordion.map((key) => {
    const accordion = content.get({ key })
    accordion.data.items = accordion.data.items && util.data.forceArray(accordion.data.items) || []
    accordions.push(accordion)
 })


  const model = { part, accordions }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
