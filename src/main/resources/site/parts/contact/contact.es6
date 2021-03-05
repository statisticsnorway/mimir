const {
  getContent, getComponent
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__( '/lib/error/error')
const {
  getContactsFromRepo
} = __non_webpack_require__('/lib/repo/statreg/contacts')
const {
  ensureArray, chunkArray
} = __non_webpack_require__('/lib/ssb/arrayUtils')
const {
  getPhrases
} = __non_webpack_require__( '/lib/language')

import { find } from 'ramda'

const moment = require('moment/min/moment-with-locales')
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
const landCodeVisual = '(+47) '
const landCode = '+47'

const transformContact = (contact) => ({
  ...contact,
  telephone: getContent().language == 'en' && contact.telephone != '' ?
    landCodeVisual.concat(treatPhoneNumber(contact.telephone)) : treatPhoneNumber(contact.telephone),
  phonelink: getContent().language == 'en' ? landCode.concat(contact.telephone) : contact.telephone
})


function renderPart(req) {
  const WIDTH = 4 // how many boxes in a row
  const page = getContent()
  const part = getComponent()

  moment.locale(page.language ? page.language : 'nb')
  const phrases = getPhrases(page)

  const statRegContacts = getContactsFromRepo()
  let contactIds = []

  if (part.config.contacts) {
    contactIds = contactIds.concat(ensureArray(part.config.contacts))
  }
  if (page.data.contacts) {
    contactIds = contactIds.concat(ensureArray(page.data.contacts))
  }

  const selectedContacts = contactIds.reduce((acc, contactId) => {
    const found = find((contact) => `${contact.id}` === `${contactId}`)(statRegContacts)
    return found ? acc.concat(transformContact(found)) : acc
  }, [])

  const contacts = chunkArray(selectedContacts, WIDTH)

  const contactTitle = phrases.contact
  if (!contacts || (contacts.length < 1)) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics` && page.type !== `${app.name}:article`) {
      return {
        body: render(view, {
          label: contactTitle
        })
      }
    } else {
      return {
        body: null
      }
    }
  }

  const model = {
    contactTitle,
    contacts
  }

  const body = render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}

