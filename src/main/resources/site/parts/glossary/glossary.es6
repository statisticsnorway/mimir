import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

exports.get = function(req) {
  const part = portal.getComponent() || req
  const view = resolve('./glossary.html')
  const glossary = []

  part.config.glossary = part.config.glossary && util.data.forceArray(part.config.glossary) || []
  part.config.glossary.map((key) => {
     const item = content.get({ key })
     glossary.push(item)
  })

  const model = { part, glossary }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
