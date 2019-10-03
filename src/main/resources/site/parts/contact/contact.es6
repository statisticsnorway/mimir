import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

exports.get = function (req) {
    const part = portal.getComponent() || req
    const view = resolve('./contact.html')

    const contactId = part.config.contact
    const contact = content.get({ key: contactId })

    const model = { contact }
    const body = thymeleaf.render(view, model)

    return { body, contentType: 'text/html' }
}
