import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

exports.get = function (req) {
    const WIDTH = 3 // how many boxes in a row
    const part = portal.getComponent() || req
    const view = resolve('./contact.html')
    const contactIdList = []

    part.config.contacts = part.config.contacts && util.data.forceArray(part.config.contacts) || []

    part.config.contacts.map((key) => {
        const contactSingle = content.get({ key })
        contactIdList.push(contactSingle)
    })

    function chunkArray(myArray, chunk_size) {
        var results = [];
        while (myArray.length) {
            results.push(myArray.splice(0, chunk_size));
        }
        return results;
    }

    const contacts = chunkArray(contactIdList, WIDTH)

    const model = { contacts, part }
    const body = thymeleaf.render(view, model)

    return { body, contentType: 'text/html' }
}
