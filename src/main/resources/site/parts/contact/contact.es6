import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

exports.get = function (req) {
    const part = portal.getComponent() || req
    const view = resolve('./contact.html')
    const contactId = part.config.contact

    contact = content.get({ key: contactId })

    log.info(JSON.stringify(contact, null, 4));

    // part.config.contact = part.config.contact && util.data.forceArray(part.config.contact) || []
    // part.config.contact.map((key) => {
    //     contact = content.get({ key })
    //     contact.data.items = contact.data.items && util.data.forceArray(contact.data.items) || []
    //     contacts.push(contact)
    // })


    const model = { part, contact }
    const body = thymeleaf.render(view, model)

    return { body, contentType: 'text/html' }
}
