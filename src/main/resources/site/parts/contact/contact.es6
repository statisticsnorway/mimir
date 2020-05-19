const {
  getContent, getComponent
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__( '/lib/error/error')
const { getContactsFromRepo } = __non_webpack_require__('/lib/repo/statreg/contacts')
const { ensureArray } = __non_webpack_require__('/lib/polyfills/xp-util')
const { chunkArray } = __non_webpack_require__('/lib/arrayUtils')
import { find } from 'ramda'

const content = __non_webpack_require__( '/lib/xp/content')
const util = __non_webpack_require__( '/lib/util')
const view = resolve('./contact.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const WIDTH = 3 // how many boxes in a row
  const part = getComponent() || req
  const page = getContent()

  const statRegContacts = getContactsFromRepo();

  // checks page content for contacts first, then part for contacts and creates array
  const contactIds = ensureArray(part.config.contacts || page.data.contacts)
  const selectedContacts = contactIds.reduce((acc, contactId) => {
    const found = find((contact) => `${contact.id}` === `${contactId}`)(statRegContacts)
    return found ? acc.concat(found) : acc
  }, [])

  const contacts = chunkArray(selectedContacts, WIDTH)

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

