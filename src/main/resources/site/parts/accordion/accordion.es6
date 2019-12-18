import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

const view = resolve('./accordion.html')

exports.get = function(req) {
  const part = portal.getComponent()
  const accordionIds = part.config.accordion ? util.data.forceArray(part.config.accordion) : []
  return renderPart(req, accordionIds)
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, accordionIds) {
  const accordions = [];
  accordionIds.forEach((key) => {
    const accordion = content.get({ key })
    if (accordion) {
      const items = accordion.data.items ? util.data.forceArray(accordion.data.items) : []
      accordions.push({
        id: accordion._id,
        body: portal.processHtml({ value: accordion.data.body }),
        open: accordion.data.open,
        items
      })
    }
  })

  const model = { accordions }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
