const {
  getComponent
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__( '/lib/error/error')

const content = __non_webpack_require__( '/lib/xp/content')
const util = __non_webpack_require__( '/lib/util')
const view = resolve('./contact.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError('Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const WIDTH = 3 // how many boxes in a row
  const part = getComponent() || req
  const contactIdList = []

  part.config.contacts = part.config.contacts && util.data.forceArray(part.config.contacts) || []

  part.config.contacts.map((key) => {
    const contactSingle = content.get({
      key
    })
    contactIdList.push(contactSingle)
  })

  const contacts = chunkArray(contactIdList, WIDTH)

  const model = {
    label: part.config.label,
    contacts
  }
  const body = render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}

function chunkArray(myArray, chunkSize) {
  const results = []
  while (myArray.length) {
    results.push(myArray.splice(0, chunkSize))
  }
  return results
}

