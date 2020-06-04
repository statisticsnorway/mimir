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
const { ensureArray, chunkArray } = __non_webpack_require__('/lib/ssb/arrayUtils')
import { find } from 'ramda'

const view = resolve('./contact.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

// split 8-digit phone numbers into groups of 2 digits each dvs. "12345678" => "12 34 56 78"
const treatPhoneNumber = (phone) => phone ? `${phone}`.match(/..?/g).join(' ') : ''

const transformContact = (contact) => ({
  ...contact,
  telephone: treatPhoneNumber(contact.telephone)
})


function renderPart(req) {
  const WIDTH = 4 // how many boxes in a row
  const page = getContent()

  const statRegContacts = getContactsFromRepo()

  const contactIds = ensureArray(page.data.contacts)
  const selectedContacts = contactIds.reduce((acc, contactId) => {
    const found = find((contact) => `${contact.id}` === `${contactId}`)(statRegContacts)
    return found ? acc.concat(transformContact(found)) : acc
  }, [])

  const contacts = chunkArray(selectedContacts, WIDTH)

  if (!contacts || (contacts.length < 1)) {
    if (req.mode === 'edit' || req.mode === 'preview') {
      return {
        body: render(view)
      }
    } else {
      return {
        body: null
      }
    }
  }

  const model = {
    label: getComponent().config.label,
    contacts
  }

  const body = render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}

