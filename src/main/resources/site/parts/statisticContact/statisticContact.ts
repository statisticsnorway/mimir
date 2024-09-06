import { type Content } from '/lib/xp/content'
import { getContent, getComponent } from '/lib/xp/portal'
import { type Phrases } from '/lib/types/language'
import { type Contact } from '/lib/ssb/dashboard/statreg/types'
import { find } from '/lib/vendor/ramda'
import { render as r4xpRender } from '/lib/enonic/react4xp'

import { renderError } from '/lib/ssb/error/error'
import { getContactsFromRepo } from '/lib/ssb/statreg/contacts'
import { ensureArray, chunkArray } from '/lib/ssb/utils/arrayUtils'
import { getPhrases } from '/lib/ssb/utils/language'
import { type ContactModel, type TransformedContact } from '/lib/types/partTypes/contact'
import { type Article, type Statistics } from '/site/content-types'

export function get(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

// split 8-digit phone numbers into groups of 2 digits each dvs. "12345678" => "12 34 56 78"
function treatPhoneNumber(phone: string): string {
  const matcher = /..?/g
  const phoneArr: Array<string> | null = phone.match(matcher)
  if (phoneArr) {
    return phoneArr.join(' ')
  } else {
    return ''
  }
}
const landCodeVisual = '(+47) '
const landCode = '+47'

function transformContact(contact: Contact, language: string): TransformedContact {
  return {
    ...contact,
    telephone:
      language == 'en' && contact.telephone != ''
        ? landCodeVisual.concat(treatPhoneNumber(contact.telephone as string))
        : treatPhoneNumber(contact.telephone as string),
    phonelink: landCode.concat(contact.telephone as string),
  }
}

function renderPart(req: XP.Request): XP.Response {
  const WIDTH = 4 // how many boxes in a row
  const page = getContent<Content<Article | Statistics>>()
  if (!page) throw Error('No page found')

  const pageLanguage: string = page.language ? page.language : 'nb'
  const part = getComponent<XP.PartComponent.Contact>()
  if (!part) throw Error('No part found')

  const phrases: Phrases = getPhrases(page) as Phrases

  const statRegContacts: Array<Contact> = getContactsFromRepo()
  let contactIds: Array<string> = []

  if (part.config.contacts) {
    contactIds = contactIds.concat(ensureArray(part.config.contacts))
  }
  if (page.data.contacts) {
    contactIds = contactIds.concat(ensureArray(page.data.contacts))
  }

  log.info('Kontakt ider: ' + JSON.stringify(contactIds, null, 4))
  log.info('statRegContactsr: ' + JSON.stringify(statRegContacts, null, 4))

  const selectedContacts: Array<TransformedContact> = contactIds.reduce((acc: Array<TransformedContact>, contactId) => {
    const found: Contact | undefined = statRegContacts
      ? find((contact: Contact) => `${contact.id}` === `${contactId}`)(statRegContacts)
      : undefined
    if (found) {
      return acc.concat(transformContact(found, pageLanguage))
    } else {
      return acc
    }
  }, [])

  const contacts: Array<Array<TransformedContact>> = chunkArray(selectedContacts, WIDTH)

  const contactTitle: string = phrases.contact

  const props: ContactModel = {
    contactTitle,
    contacts,
  }

  return r4xpRender('site/parts/statisticContact/statisticContact', props, req)
}
