const util = __non_webpack_require__( '/lib/util')
const portal = __non_webpack_require__( '/lib/xp/portal')
const content = __non_webpack_require__( '/lib/xp/content')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')

exports.get = function(req) {
  const WIDTH = 3 // how many boxes in a row
  const part = portal.getComponent() || req
  const view = resolve('./contact.html')
  const contactIdList = []

  part.config.contacts = part.config.contacts && util.data.forceArray(part.config.contacts) || []

  part.config.contacts.map((key) => {
    const contactSingle = content.get({
      key
    })
    contactIdList.push(contactSingle)
  })

  function chunkArray(myArray, chunkSize) {
    const results = []
    while (myArray.length) {
      results.push(myArray.splice(0, chunkSize))
    }
    return results
  }

  const contacts = chunkArray(contactIdList, WIDTH)

  const model = {
    contacts,
    part
  }
  const body = thymeleaf.render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}
