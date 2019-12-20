import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

const view = resolve('./button.html')

exports.get = function(req) {
  const part = portal.getComponent()
  const buttonsIds = part.config.button ? util.data.forceArray(part.config.button) : []
  return renderPart(req, buttonsIds);
}

exports.preview = function(req, id) {
  return renderPart(req, [id]);
}

function renderPart(req, buttonIds) {
  const buttons = []
  buttonIds.forEach((key) => {
    const button = content.get({ key })
    if (button && button.data.link) {
      const target = content.get({ key: button.data.link })
      if (target) {
        const href = getHref(target)
        buttons.push({
          displayName: button.displayName,
          href
        })
      }
    }
  })

  const model = { buttons }
  const body = thymeleaf.render(view, model)
  return { body, contentType: 'text/html' }
}

/**
 * create a href link for the button based on target
 * @param {object} target content
 * @return {string}
 */
function getHref(target) {
  if (target.type === `${app.name}:page`) {
    return portal.pageUrl({
      id: target._id
    })
  } else {
    return portal.attachmentUrl({
      id: target._id
    })
  }
}
