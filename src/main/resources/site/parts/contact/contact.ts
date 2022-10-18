import { Content } from '/lib/xp/content'
import { getContent, getComponent, Component } from '/lib/xp/portal'
import { ResourceKey, render } from '/lib/thymeleaf'
import { Phrases } from '../../../lib/types/language'
import { Contact } from '../../../lib/ssb/dashboard/statreg/types'
import { ContactPartConfig } from './contact-part-config'
import {Article} from '../../content-types/article/article';
import {Statistics} from '../../content-types/statistics/statistics';

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  getContactsFromRepo
} = __non_webpack_require__('/lib/ssb/statreg/contacts')
const {
  ensureArray, chunkArray
} = __non_webpack_require__('/lib/ssb/utils/arrayUtils')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  find
} = __non_webpack_require__('/lib/vendor/ramda')

const view: ResourceKey = resolve('./contact.html') as ResourceKey

exports.get = function(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request) => renderPart(req)

// split 8-digit phone numbers into groups of 2 digits each dvs. "12345678" => "12 34 56 78"
function treatPhoneNumber (phone: string): string {
  const matcher: RegExp = /..?/g
  const phoneArr: Array<string> | null = phone.match(matcher)
  if (phoneArr) {
    return phoneArr.join(' ')
  } else {
    return ''
  }
}
const landCodeVisual: string = '(+47) '
const landCode: string = '+47'

function transformContact(contact: Contact, language: string): TransformedContact {
  return {
    ...contact,
    telephone: language == 'en' && contact.telephone != '' ?
        landCodeVisual.concat(treatPhoneNumber(contact.telephone as string)) : treatPhoneNumber(contact.telephone as string),
    phonelink: landCode.concat(contact.telephone as string)
  }
}


function renderPart(req: XP.Request): XP.Response {
  const WIDTH: number = 4 // how many boxes in a row
  const page: Content<Article|Statistics> = getContent()
  const pageLanguage: string = page.language ? page.language : 'nb'
  const part: Component<ContactPartConfig> = getComponent()

  const phrases: Phrases = getPhrases(page) as Phrases

  const statRegContacts: Array<Contact> | null = getContactsFromRepo()
  let contactIds: Array<string> = []

  if (part.config.contacts) {
    contactIds = contactIds.concat(ensureArray(part.config.contacts))
  }
  if (page.data.contacts) {
    contactIds = contactIds.concat(ensureArray(page.data.contacts))
  }

  const selectedContacts: Array<TransformedContact> = contactIds.reduce((acc: Array<TransformedContact>, contactId) => {
    const found: Contact | undefined = statRegContacts ? find((contact: Contact) => `${contact.id}` === `${contactId}`)(statRegContacts) : undefined
    if (found) {
      return acc.concat(transformContact(found, pageLanguage))
    } else {
      return acc
    }
  }, [])

  const contacts: Array<Array<TransformedContact>> = chunkArray(selectedContacts, WIDTH)

  const contactTitle: string = phrases.contact
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

  const model: ContactModel = {
    contactTitle,
    contacts
  }

  const body: string = render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}

interface TransformedContact extends Contact {
  phonelink: string;
}

interface ContactModel {
  contactTitle: string;
  contacts: Array<Array<TransformedContact>>
}
